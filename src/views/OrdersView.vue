<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, CheckCircle2, PackageSearch, RefreshCw } from '@lucide/vue'
import AlertConfirmationDialog from '@/components/AlertConfirmationDialog.vue'
import LoadingState from '@/components/LoadingState.vue'
import OrdersResults from '@/components/OrdersResults.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import SearchFiltersForm from '@/components/SearchFiltersForm.vue'
import { getErrorMessage, getFieldErrors } from '@/api/http'
import { searchMedications, searchOrders, sendBuyerAlert } from '@/api/pharmacovigilance'
import type { Medication, Order, PaginationMeta, SearchFilters } from '@/types/api'

const route = useRoute()
const router = useRouter()

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const today = new Date()
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

const defaultFilters: SearchFilters = {
  lot_number: '951357',
  start_date: formatDate(thirtyDaysAgo),
  end_date: formatDate(today),
  page: 1,
}

const filters = ref<SearchFilters>({ ...defaultFilters })
const medications = ref<Medication[]>([])
const orders = ref<Order[]>([])
const meta = ref<PaginationMeta | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const alertOrder = ref<Order | null>(null)
const sendingAlert = ref(false)
const alertError = ref('')
const toast = ref('')

const activeMedication = computed(() => medications.value[0])

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
      searchMedications(filters.value.lot_number),
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
  const target = {
    lot_number: nextFilters.lot_number,
    start_date: nextFilters.start_date,
    end_date: nextFilters.end_date,
    page: String(nextFilters.page),
  }
  const unchanged = Object.entries(target).every(([key, value]) => route.query[key] === value)
  if (unchanged) await loadResults()
  else await router.push({ name: 'orders', query: target })
}

function changePage(page: number) {
  void router.push({ name: 'orders', query: { ...route.query, page: String(page) } })
}

function openAlert(order: Order) {
  alertOrder.value = order
  alertError.value = ''
}

function closeAlert() {
  alertOrder.value = null
  alertError.value = ''
}

async function confirmAlert() {
  if (!alertOrder.value || sendingAlert.value) return
  sendingAlert.value = true
  alertError.value = ''
  try {
    const response = await sendBuyerAlert(alertOrder.value.id, filters.value.lot_number)
    closeAlert()
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

async function handleRouteChange() {
  const hasSearchQuery = ['lot_number', 'start_date', 'end_date', 'page'].every(
    (key) => typeof route.query[key] === 'string',
  )

  if (!hasSearchQuery) {
    await router.replace({
      name: 'orders',
      query: {
        lot_number: defaultFilters.lot_number,
        start_date: defaultFilters.start_date,
        end_date: defaultFilters.end_date,
        page: '1',
      },
    })
    return
  }

  await loadResults()
}

watch(() => route.fullPath, handleRouteChange, { immediate: true })
</script>

<template>
  <section>
    <header class="page-heading">
      <div>
        <p class="eyebrow">Recall response workspace</p>
        <h1>Find affected buyers</h1>
        <p>Search a medication lot, review matching purchases, and notify each buyer safely.</p>
      </div>
      <span class="security-note"><CheckCircle2 :size="17" /> Secure pharmacy session</span>
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
        <div>
          <small>Affected medication</small><strong>{{ activeMedication.name }}</strong>
        </div>
        <div>
          <small>Lot number</small><strong>{{ activeMedication.lot_number }}</strong>
        </div>
        <div>
          <small>Date window</small
          ><strong>{{ filters.start_date }} – {{ filters.end_date }}</strong>
        </div>
        <div>
          <small>Matching orders</small><strong>{{ meta?.total ?? orders.length }}</strong>
        </div>
      </section>

      <section class="panel results-panel">
        <header class="panel__header">
          <div>
            <p class="eyebrow">Search results</p>
            <h2>Affected purchase records</h2>
          </div>
          <span v-if="meta" class="result-count"
            >{{ meta.total }} {{ meta.total === 1 ? 'order' : 'orders' }}</span
          >
        </header>

        <div v-if="orders.length">
          <OrdersResults :orders="orders" :lot-number="filters.lot_number" @alert="openAlert" />
          <PaginationControls v-if="meta" :meta="meta" @change="changePage" />
        </div>
        <div v-else class="empty-results">
          <PackageSearch :size="42" />
          <h2>No affected orders found</h2>
          <p>No purchases matched lot {{ filters.lot_number }} in the selected date range.</p>
        </div>
      </section>
    </template>

    <AlertConfirmationDialog
      :open="Boolean(alertOrder)"
      :order="alertOrder"
      :lot-number="filters.lot_number"
      :sending="sendingAlert"
      :error="alertError"
      @close="closeAlert"
      @confirm="confirmAlert"
    />

    <Transition name="toast">
      <div v-if="toast" class="toast" role="status"><CheckCircle2 :size="19" />{{ toast }}</div>
    </Transition>
  </section>
</template>
