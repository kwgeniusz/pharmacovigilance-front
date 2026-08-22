import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SearchFiltersForm from '@/components/SearchFiltersForm.vue'
import type { SearchFilters } from '@/types/api'

const filters: SearchFilters = {
  lot_number: '951357',
  start_date: '2026-07-23',
  end_date: '2026-08-22',
  page: 1,
}

describe('SearchFiltersForm', () => {
  it('emits normalized filters and resets pagination', async () => {
    const wrapper = mount(SearchFiltersForm, {
      props: { filters: { ...filters, page: 3 }, loading: false },
    })

    await wrapper.get('#lot-number').setValue(' 951357 ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('search')?.[0]?.[0]).toEqual(filters)
  })

  it('rejects a reversed date range', async () => {
    const wrapper = mount(SearchFiltersForm, { props: { filters, loading: false } })

    await wrapper.get('#start-date').setValue('2026-08-22')
    await wrapper.get('#end-date').setValue('2026-08-01')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('End date must be on or after the start date.')
    expect(wrapper.emitted('search')).toBeUndefined()
  })
})
