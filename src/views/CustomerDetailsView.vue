<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, CalendarDays, Mail, Package, Phone, ReceiptText, UserRound } from '@lucide/vue'
import LoadingState from '@/components/LoadingState.vue'
import { getErrorMessage } from '@/api/http'
import { getCustomer } from '@/api/pharmacovigilance'
import type { Customer } from '@/types/api'

const route = useRoute()
const customer = ref<Customer | null>(null)
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    customer.value = await getCustomer(Number(route.params.customerId))
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'This buyer could not be found or loaded.')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section>
    <RouterLink class="back-link" :to="{ name: 'orders', query: route.query }"
      ><ArrowLeft :size="17" /> Back to affected orders</RouterLink
    >
    <LoadingState v-if="loading" label="Loading buyer details" />
    <div v-else-if="errorMessage" class="error-panel" role="alert">
      <UserRound :size="28" />
      <h2>Buyer unavailable</h2>
      <p>{{ errorMessage }}</p>
    </div>

    <template v-else-if="customer">
      <header class="page-heading detail-heading">
        <div>
          <p class="eyebrow">Buyer profile</p>
          <h1>{{ customer.name }}</h1>
          <p>Review contact information and complete medication purchase history.</p>
        </div>
        <span class="security-note"><UserRound :size="17" /> Customer #{{ customer.id }}</span>
      </header>

      <section class="customer-contact-grid">
        <article class="contact-card">
          <span><Mail :size="20" /></span>
          <div>
            <small>Email address</small
            ><a :href="`mailto:${customer.email}`">{{ customer.email }}</a>
          </div>
        </article>
        <article class="contact-card">
          <span><Phone :size="20" /></span>
          <div>
            <small>Phone number</small><a :href="`tel:${customer.phone}`">{{ customer.phone }}</a>
          </div>
        </article>
      </section>

      <section class="panel history-panel">
        <header class="panel__header">
          <div>
            <p class="eyebrow">Purchase history</p>
            <h2>Customer orders</h2>
          </div>
          <span class="item-count">{{ customer.orders?.length ?? 0 }}</span>
        </header>
        <div v-if="customer.orders?.length" class="history-list">
          <article v-for="order in customer.orders" :key="order.id" class="history-item">
            <div class="history-item__identity">
              <span class="section-icon"><ReceiptText :size="19" /></span>
              <div>
                <small>Order</small><strong>#{{ order.id }}</strong>
              </div>
            </div>
            <div>
              <small><CalendarDays :size="14" /> Purchase date</small
              ><strong>{{ order.purchase_date }}</strong>
            </div>
            <div class="history-medications">
              <small><Package :size="14" /> Medications</small
              ><span v-for="item in order.items" :key="item.id"
                >{{ item.medication.name }} · Lot {{ item.medication.lot_number }}</span
              >
            </div>
            <RouterLink
              class="button button--secondary button--small"
              :to="{ name: 'order-details', params: { orderId: order.id }, query: route.query }"
              >View order</RouterLink
            >
          </article>
        </div>
        <div v-else class="empty-results">
          <ReceiptText :size="40" />
          <h2>No order history</h2>
          <p>This customer has no recorded purchases.</p>
        </div>
      </section>
    </template>
  </section>
</template>
