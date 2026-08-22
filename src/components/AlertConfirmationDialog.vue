<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { AlertTriangle, Mail, X } from '@lucide/vue'
import type { Order } from '@/types/api'

const props = defineProps<{
  open: boolean
  order: Order | null
  lotNumber: string
  sending: boolean
  error: string
}>()
const emit = defineEmits<{ close: []; confirm: [] }>()
const dialog = ref<HTMLDialogElement>()

watch(
  () => props.open,
  async (open) => {
    await nextTick()
    if (open && !dialog.value?.open) dialog.value?.showModal()
    if (!open && dialog.value?.open) dialog.value.close()
  },
  { immediate: true },
)

function close() {
  if (!props.sending) emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="alert-dialog" @cancel.prevent="close" @click.self="close">
    <div v-if="order" class="alert-dialog__content">
      <header class="alert-dialog__header">
        <span class="warning-icon"><AlertTriangle :size="24" /></span>
        <div>
          <h2>Send Alert to Customer</h2>
        </div>
        <button
          class="dialog-close"
          type="button"
          aria-label="Close dialog"
          :disabled="sending"
          @click="close"
        >
          <X :size="20" />
        </button>
      </header>

      <div class="alert-dialog__body">
        <p>
          A warning email will be sent to <strong>{{ order.customer.name }}</strong
          >.
        </p>
        <div class="recipient-card">
          <Mail :size="18" />
          <span
            ><small>Recipient</small><strong>{{ order.customer.email }}</strong></span
          >
        </div>
        <dl class="alert-summary">
          <div>
            <dt>Medication</dt>
            <dd>{{ order.items[0]?.medication.name }}</dd>
          </div>
          <div>
            <dt>Lot number</dt>
            <dd>{{ lotNumber }}</dd>
          </div>
          <div>
            <dt>Order</dt>
            <dd>#{{ order.id }}</dd>
          </div>
        </dl>
        <div class="warning-copy">
          <strong>Recommended action</strong>
          <p>
            Stop using the affected medication and contact the compounding pharmacy for guidance.
          </p>
        </div>
        <div v-if="error" class="alert-box" role="alert">
          <AlertTriangle :size="18" />{{ error }}
        </div>
      </div>

      <footer class="alert-dialog__footer">
        <button class="button button--secondary" type="button" :disabled="sending" @click="close">
          Cancel
        </button>
        <button
          class="button button--warning"
          type="button"
          :disabled="sending"
          @click="emit('confirm')"
        >
          <span v-if="sending" class="spinner" aria-hidden="true"></span>
          <Mail v-else :size="17" />
          {{ sending ? 'Sending…' : 'Send Email' }}
        </button>
      </footer>
    </div>
  </dialog>
</template>
