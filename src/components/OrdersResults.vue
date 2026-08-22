<script setup lang="ts">
import { BellRing, Eye, Mail, Phone, UserRound } from '@lucide/vue'
import { useRoute } from 'vue-router'
import type { Order } from '@/types/api'

defineProps<{ orders: Order[]; lotNumber: string }>()
const emit = defineEmits<{ alert: [order: Order] }>()
const route = useRoute()

function detailQuery() {
  return { ...route.query }
}
</script>

<template>
  <div class="orders-table-wrap">
    <table class="orders-table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Contact</th>
          <th>Purchase date</th>
          <th>Medication</th>
          <th><span class="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>
            <strong>#{{ order.id }}</strong>
          </td>
          <td>
            <RouterLink
              class="customer-link"
              :to="{
                name: 'customer-details',
                params: { customerId: order.customer.id },
                query: detailQuery(),
              }"
            >
              {{ order.customer.name }}
            </RouterLink>
          </td>
          <td>
            <span class="contact-line"><Mail :size="14" />{{ order.customer.email }}</span>
            <span class="contact-line"><Phone :size="14" />{{ order.customer.phone }}</span>
          </td>
          <td>{{ order.purchase_date }}</td>
          <td>
            <div class="medication-cell">
              <strong>{{ order.items[0]?.medication.name }}</strong>
              <span class="lot-badge">Lot {{ lotNumber }}</span>
            </div>
          </td>
          <td>
            <div class="row-actions">
              <RouterLink
                class="icon-button"
                :to="{ name: 'order-details', params: { orderId: order.id }, query: detailQuery() }"
                :aria-label="`View order ${order.id}`"
                title="View order"
                ><Eye :size="17"
              /></RouterLink>
              <RouterLink
                class="icon-button"
                :to="{
                  name: 'customer-details',
                  params: { customerId: order.customer.id },
                  query: detailQuery(),
                }"
                :aria-label="`View buyer ${order.customer.name}`"
                title="View buyer"
                ><UserRound :size="17"
              /></RouterLink>
              <button
                class="icon-button icon-button--warning"
                type="button"
                :aria-label="`Alert buyer ${order.customer.name}`"
                title="Alert buyer"
                @click="emit('alert', order)"
              >
                <BellRing :size="17" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="order-cards">
      <article v-for="order in orders" :key="order.id" class="order-card">
        <header>
          <span class="order-card__id">Order #{{ order.id }}</span>
          <span class="lot-badge">Lot {{ lotNumber }}</span>
        </header>
        <h3>{{ order.customer.name }}</h3>
        <p>{{ order.items[0]?.medication.name }}</p>
        <dl>
          <div>
            <dt>Purchase date</dt>
            <dd>{{ order.purchase_date }}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{{ order.customer.email }}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{{ order.customer.phone }}</dd>
          </div>
        </dl>
        <footer>
          <RouterLink
            class="button button--secondary button--small"
            :to="{ name: 'order-details', params: { orderId: order.id }, query: detailQuery() }"
            ><Eye :size="15" /> View</RouterLink
          >
          <RouterLink
            class="button button--secondary button--small"
            :to="{
              name: 'customer-details',
              params: { customerId: order.customer.id },
              query: detailQuery(),
            }"
            ><UserRound :size="15" /> Buyer</RouterLink
          >
          <button
            class="button button--warning button--small"
            type="button"
            @click="emit('alert', order)"
          >
            <BellRing :size="15" /> Alert
          </button>
        </footer>
      </article>
    </div>
  </div>
</template>
