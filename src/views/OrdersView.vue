<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, CheckCircle2, Download, PackageSearch, RefreshCw } from '@lucide/vue'
import AlertConfirmationDialog from '@/components/AlertConfirmationDialog.vue'
import LoadingState from '@/components/LoadingState.vue'
import OrdersResults from '@/components/OrdersResults.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import SearchFiltersForm from '@/components/SearchFiltersForm.vue'
import { getErrorMessage, getFieldErrors } from '@/api/http'
import {
  exportOrders,
  searchMedications,
  searchOrders,
  sendBuyerAlert,
} from '@/api/pharmacovigilance'
import { useAuthStore } from '@/stores/auth'
import type { Medication, Order, PaginationMeta, SearchFilters } from '@/types/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const defaultFilters: SearchFilters = {
  lot_number: '',
  start_date: '',
  end_date: '',
  page: 1,
}

const filters = ref<SearchFilters>({ ...defaultFilters })
const medications = ref<Medication[]>([])
const orders = ref<Order[]>([])
const meta = ref<PaginationMeta | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const alertOrder = ref<Order | null>(null)
const alertLotNumber = ref('')
const sendingAlert = ref(false)
const alertError = ref('')
const toast = ref('')
const toastIsError = ref(false)
const exporting = ref(false)

const activeMedication = computed(() => medications.value[0])
const activeDateRange = computed(() => {
  if (filters.value.start_date && filters.value.end_date) {
    return `${filters.value.start_date} – ${filters.value.end_date}`
  }
  if (filters.value.start_date) return `From ${filters.value.start_date}`
  if (filters.value.end_date) return `Until ${filters.value.end_date}`
  return ''
})

function filtersFromRoute(): SearchFilters {
  return {
    lot_number:
      typeof route.query.lot_number === 'string'
        ? route.query.lot_number
        : defaultFilters.lot_number,
    start_date:
      typeof route.query.start_date === 'string'
        ? route.query.start_date
        : defaultFilters.start_date,
    end_date:
      typeof route.query.end_date === 'string' ? route.query.end_date : defaultFilters.end_date,
    page: Math.max(1, Number(route.query.page) || 1),
  }
}

async function loadResults() {
  filters.value = filtersFromRoute()
  loading.value = true
  errorMessage.value = ''

  try {
    const [medicationData, orderData] = await Promise.all([
      filters.value.lot_number
        ? searchMedications(filters.value.lot_number)
        : Promise.resolve([]),
      searchOrders(filters.value),
    ])
    medications.value = medicationData
    orders.value = orderData.data
    meta.value = orderData.meta
  } catch (error) {
    const fields = getFieldErrors(error)
    errorMessage.value =
      Object.values(fields)[0]?.[0] ?? getErrorMessage(error, 'Unable to load affected orders.')
    medications.value = []
    orders.value = []
    meta.value = null
  } finally {
    loading.value = false
  }
}

async function applySearch(nextFilters: SearchFilters) {
  const target: Record<string, string> = {}
  if (nextFilters.lot_number) target.lot_number = nextFilters.lot_number
  if (nextFilters.start_date) target.start_date = nextFilters.start_date
  if (nextFilters.end_date) target.end_date = nextFilters.end_date

  const current = Object.fromEntries(
    Object.entries(route.query).filter(([, value]) => typeof value === 'string'),
  )
  const unchanged = JSON.stringify(current) === JSON.stringify(target)
  if (unchanged) await loadResults()
  else await router.push({ name: 'orders', query: target })
}

function changePage(page: number) {
  void router.push({ name: 'orders', query: { ...route.query, page: String(page) } })
}

function openAlert(order: Order) {
  alertOrder.value = order
  alertLotNumber.value = filters.value.lot_number
  alertError.value = ''
}

function closeAlert() {
  alertOrder.value = null
  alertLotNumber.value = ''
  alertError.value = ''
}

async function confirmAlert() {
  if (!alertOrder.value || sendingAlert.value) return
  sendingAlert.value = true
  alertError.value = ''
  try {
    const response = await sendBuyerAlert(alertOrder.value.id, alertLotNumber.value)
    closeAlert()
    toastIsError.value = false
    toast.value = response.message
    window.setTimeout(() => (toast.value = ''), 4500)
  } catch (error) {
    const fields = getFieldErrors(error)
    alertError.value =
      fields.lot_number?.[0] ?? getErrorMessage(error, 'Unable to send the warning email.')
  } finally {
    sendingAlert.value = false
  }
}

async function downloadCsv() {
  if (auth.user?.role !== 'administrator' || exporting.value) return

  exporting.value = true

  try {
    const csv = await exportOrders(filters.value)
    const url = URL.createObjectURL(csv)
    const link = document.createElement('a')
    link.href = url
    link.download = `affected-orders-${filters.value.lot_number || 'all'}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  } catch (error) {
    toastIsError.value = true
    toast.value = getErrorMessage(error, 'Unable to export affected orders.')
    window.setTimeout(() => (toast.value = ''), 4500)
  } finally {
    exporting.value = false
  }
}

async function handleRouteChange() {
  await loadResults()
}

watch(() => route.fullPath, handleRouteChange, { immediate: true })
</script>

<template>
  <section>
    <header class="page-heading page-heading--compact">
      <h1>Order Search</h1>
      <button
        v-if="auth.user?.role === 'administrator'"
        class="button button--secondary"
        type="button"
        :disabled="loading || exporting || !meta?.total"
        @click="downloadCsv"
      >
        <span v-if="exporting" class="spinner" aria-hidden="true"></span>
        <Download v-else :size="17" />
        {{ exporting ? 'Exporting…' : 'Export CSV' }}
      </button>
    </header>

    <section class="panel search-panel">
      <div class="panel__body">
        <SearchFiltersForm :filters="filters" :loading="loading" @search="applySearch" />
      </div>
    </section>

    <LoadingState v-if="loading" label="Searching medication and order records" />

    <section v-else-if="errorMessage" class="error-panel" role="alert">
      <AlertCircle :size="26" />
      <div>
        <h2>We could not complete the search</h2>
        <p>{{ errorMessage }}</p>
      </div>
      <button class="button button--secondary" type="button" @click="loadResults">
        <RefreshCw :size="17" /> Try again
      </button>
    </section>

    <template v-else>
      <section v-if="activeMedication" class="medication-summary">
        <span class="medication-summary__icon"><PackageSearch :size="23" /></span>
        <div class="medication-summary__identity">
          <strong>{{ activeMedication.name }}</strong>
          <span>Lot {{ activeMedication.lot_number }}</span>
        </div>
        <span v-if="activeDateRange" class="medication-summary__meta">{{ activeDateRange }}</span>
        <strong class="medication-summary__count"
          >{{ meta?.total ?? orders.length }}
          {{ (meta?.total ?? orders.length) === 1 ? 'order' : 'orders' }}</strong
        >
      </section>

      <section class="panel results-panel">
        <header class="panel__header">
          <h2>Order Results</h2>
          <span v-if="meta" class="result-count"
            >{{ meta.total }} {{ meta.total === 1 ? 'order' : 'orders' }}</span
          >
        </header>

        <div v-if="orders.length">
          <OrdersResults
            :orders="orders"
            :alert-lot-number="filters.lot_number"
            @alert="openAlert"
          />
          <PaginationControls v-if="meta" :meta="meta" @change="changePage" />
        </div>
        <div v-else class="empty-results">
          <PackageSearch :size="42" />
          <h2>No orders found</h2>
          <p>No orders matched the selected filters.</p>
        </div>
      </section>
    </template>

    <AlertConfirmationDialog
      :open="Boolean(alertOrder)"
      :order="alertOrder"
      :lot-number="alertLotNumber"
      :sending="sendingAlert"
      :error="alertError"
      @close="closeAlert"
      @confirm="confirmAlert"
    />

    <Transition name="toast">
      <div v-if="toast" class="toast" :class="{ 'toast--error': toastIsError }" role="status">
        <AlertCircle v-if="toastIsError" :size="19" />
        <CheckCircle2 v-else :size="19" />
        {{ toast }}
      </div>
    </Transition>
  </section>
</template>
