<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, CalendarDays, Mail, Package, Phone, ReceiptText, UserRound } from '@lucide/vue'
import LoadingState from '@/components/LoadingState.vue'
import { getErrorMessage } from '@/api/http'
import { getOrder } from '@/api/pharmacovigilance'
import type { Order } from '@/types/api'

const route = useRoute()
const order = ref<Order | null>(null)
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    order.value = await getOrder(Number(route.params.orderId))
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'This order could not be found or loaded.')
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
    <LoadingState v-if="loading" label="Loading order details" />
    <div v-else-if="errorMessage" class="error-panel" role="alert">
      <ReceiptText :size="28" />
      <h2>Order unavailable</h2>
      <p>{{ errorMessage }}</p>
    </div>

    <template v-else-if="order">
      <header class="page-heading detail-heading">
        <div>
          <p class="eyebrow">Purchase record</p>
          <h1>Order #{{ order.id }}</h1>
          <p>Review the buyer and every medication associated with this purchase.</p>
        </div>
        <span class="detail-date"
          ><CalendarDays :size="17" /> Purchased {{ order.purchase_date }}</span
        >
      </header>

      <div class="detail-layout">
        <section class="panel detail-card">
          <header class="panel__header">
            <div>
              <p class="eyebrow">Medication record</p>
              <h2>Items in this order</h2>
            </div>
            <span class="item-count">{{ order.items.length }}</span>
          </header>
          <div class="item-list">
            <article v-for="item in order.items" :key="item.id" class="medication-item">
              <span class="medication-item__icon"><Package :size="21" /></span>
              <div>
                <small>Medication</small><strong>{{ item.medication.name }}</strong>
              </div>
              <div>
                <small>Lot number</small
                ><span class="lot-badge">{{ item.medication.lot_number }}</span>
              </div>
            </article>
          </div>
        </section>

        <aside class="panel buyer-card">
          <header>
            <span class="section-icon"><UserRound :size="20" /></span>
            <div>
              <small>Buyer</small>
              <h2>{{ order.customer.name }}</h2>
            </div>
          </header>
          <dl>
            <div>
              <dt><Mail :size="16" /> Email</dt>
              <dd>
                <a :href="`mailto:${order.customer.email}`">{{ order.customer.email }}</a>
              </dd>
            </div>
            <div>
              <dt><Phone :size="16" /> Phone</dt>
              <dd>
                <a :href="`tel:${order.customer.phone}`">{{ order.customer.phone }}</a>
              </dd>
            </div>
          </dl>
          <RouterLink
            class="button button--secondary button--full"
            :to="{
              name: 'customer-details',
              params: { customerId: order.customer.id },
              query: route.query,
            }"
            ><UserRound :size="17" /> View buyer history</RouterLink
          >
        </aside>
      </div>
    </template>
  </section>
</template>
