<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { PaginationMeta } from '@/types/api'

defineProps<{ meta: PaginationMeta }>()
const emit = defineEmits<{ change: [page: number] }>()
</script>

<template>
  <nav class="pagination" aria-label="Orders pagination">
    <p>Showing {{ meta.from ?? 0 }}–{{ meta.to ?? 0 }} of {{ meta.total }} orders</p>
    <div class="pagination__buttons">
      <button
        class="button button--secondary button--small"
        type="button"
        :disabled="meta.current_page <= 1"
        @click="emit('change', meta.current_page - 1)"
      >
        <ChevronLeft :size="16" /> Previous
      </button>
      <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
      <button
        class="button button--secondary button--small"
        type="button"
        :disabled="meta.current_page >= meta.last_page"
        @click="emit('change', meta.current_page + 1)"
      >
        Next <ChevronRight :size="16" />
      </button>
    </div>
  </nav>
</template>
