import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import OrdersView from '@/views/OrdersView.vue'
import * as api from '@/api/pharmacovigilance'

vi.mock('@/api/pharmacovigilance', () => ({
  searchMedications: vi.fn<(...args: never[]) => Promise<never>>(),
  searchOrders: vi.fn<(...args: never[]) => Promise<never>>(),
  sendBuyerAlert: vi.fn<(...args: never[]) => Promise<never>>(),
}))

const order = {
  id: 1,
  purchase_date: '2026-08-12',
  customer: { id: 1, name: 'Alice Johnson', email: 'alice@example.test', phone: '+1 555 010 1001' },
  items: [{ id: 1, medication: { id: 1, name: 'Compounded Metformin', lot_number: '951357' } }],
}

function response(data = [order]) {
  return {
    data,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: 1,
      from: data.length ? 1 : null,
      last_page: 1,
      links: [],
      path: '/api/orders',
      per_page: 15,
      to: data.length,
      total: data.length,
    },
  }
}

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/pharmacovigilance/orders', name: 'orders', component: OrdersView },
      {
        path: '/pharmacovigilance/orders/:orderId',
        name: 'order-details',
        component: { template: '<div />' },
      },
      {
        path: '/pharmacovigilance/customers/:customerId',
        name: 'customer-details',
        component: { template: '<div />' },
      },
    ],
  })
  await router.push(
    '/pharmacovigilance/orders?lot_number=951357&start_date=2026-07-23&end_date=2026-08-22&page=1',
  )
  await router.isReady()
  const wrapper = mount(OrdersView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('OrdersView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.searchMedications).mockResolvedValue([
      { id: 1, name: 'Compounded Metformin', lot_number: '951357' },
    ])
    vi.mocked(api.searchOrders).mockResolvedValue(response())
  })

  it('loads medication and paginated order results from URL filters', async () => {
    const wrapper = await mountView()

    expect(api.searchOrders).toHaveBeenCalledWith({
      lot_number: '951357',
      start_date: '2026-07-23',
      end_date: '2026-08-22',
      page: 1,
    })
    expect(wrapper.text()).toContain('Compounded Metformin')
    expect(wrapper.text()).toContain('Alice Johnson')
    expect(wrapper.text()).toContain('Showing 1–1 of 1 orders')
  })

  it('renders a useful empty state', async () => {
    vi.mocked(api.searchOrders).mockResolvedValue(response([]))
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No affected orders found')
    expect(wrapper.text()).toContain('951357')
  })
})
