<script setup lang="ts">
import { reactive, watch } from 'vue'
import { CalendarDays, Search } from '@lucide/vue'
import type { SearchFilters } from '@/types/api'

const props = defineProps<{ filters: SearchFilters; loading: boolean }>()
const emit = defineEmits<{ search: [filters: SearchFilters] }>()

const form = reactive({ ...props.filters })
const errors = reactive<Record<string, string>>({})

watch(
  () => props.filters,
  (filters) => Object.assign(form, filters),
  { deep: true },
)

function submit() {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!form.lot_number.trim()) errors.lot_number = 'Lot number is required.'
  if (!form.start_date) errors.start_date = 'Start date is required.'
  if (!form.end_date) errors.end_date = 'End date is required.'
  if (form.start_date && form.end_date && form.start_date > form.end_date) {
    errors.end_date = 'End date must be on or after the start date.'
  }

  if (Object.keys(errors).length) return
  emit('search', { ...form, lot_number: form.lot_number.trim(), page: 1 })
}
</script>

<template>
  <form class="search-form" novalidate @submit.prevent="submit">
    <div class="search-form__heading">
      <span class="section-icon"><Search :size="20" /></span>
      <strong>Medication Search</strong>
    </div>

    <div class="field search-form__lot">
      <label for="lot-number">Lot number</label>
      <input
        id="lot-number"
        v-model="form.lot_number"
        inputmode="numeric"
        placeholder="e.g. 951357"
        :aria-invalid="Boolean(errors.lot_number)"
      />
      <p v-if="errors.lot_number" class="field__error">{{ errors.lot_number }}</p>
    </div>

    <div class="field">
      <label for="start-date">Start date</label>
      <div class="date-field">
        <CalendarDays :size="17" aria-hidden="true" />
        <input
          id="start-date"
          v-model="form.start_date"
          type="date"
          :aria-invalid="Boolean(errors.start_date)"
        />
      </div>
      <p v-if="errors.start_date" class="field__error">{{ errors.start_date }}</p>
    </div>

    <div class="field">
      <label for="end-date">End date</label>
      <div class="date-field">
        <CalendarDays :size="17" aria-hidden="true" />
        <input
          id="end-date"
          v-model="form.end_date"
          type="date"
          :aria-invalid="Boolean(errors.end_date)"
        />
      </div>
      <p v-if="errors.end_date" class="field__error">{{ errors.end_date }}</p>
    </div>

    <button class="button button--primary search-form__button" type="submit" :disabled="loading">
      <span v-if="loading" class="spinner" aria-hidden="true"></span>
      <Search v-else :size="18" />
      {{ loading ? 'Searching…' : 'Search' }}
    </button>
  </form>
</template>
