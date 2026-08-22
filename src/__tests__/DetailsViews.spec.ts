import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CustomerDetailsView from '@/views/CustomerDetailsView.vue'
import OrderDetailsView from '@/views/OrderDetailsView.vue'
import * as api from '@/api/pharmacovigilance'

vi.mock('@/api/pharmacovigilance', () => ({
  getOrder: vi.fn<(...args: never[]) => Promise<never>>(),
  getCustomer: vi.fn<(...args: never[]) => Promise<never>>(),
}))

const customer = {
  id: 1,
  name: 'Alice Johnson',
  email: 'alice@example.test',
  phone: '+1 555 010 1001',
}
const order = {
  id: 1,
  purchase_date: '2026-08-12',
  customer,
  items: [
    {
      id: 1,
      medication: { id: 1, name: 'Compounded Metformin', lot_number: '951357' },
    },
  ],
}

async function mountAt(component: object, path: string, routePath: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: routePath, component },
      { path: '/pharmacovigilance/orders', name: 'orders', component: { template: '<div />' } },
      {
        path: '/pharmacovigilance/orders/:orderId',
        name: 'order-details',
        component: OrderDetailsView,
      },
      {
        path: '/pharmacovigilance/customers/:customerId',
        name: 'customer-details',
        component: CustomerDetailsView,
      },
    ],
  })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(component, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('detail views', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders an order with buyer and medication details', async () => {
    vi.mocked(api.getOrder).mockResolvedValue(order)
    const wrapper = await mountAt(
      OrderDetailsView,
      '/pharmacovigilance/orders/1',
      '/pharmacovigilance/orders/:orderId',
    )

    expect(api.getOrder).toHaveBeenCalledWith(1)
    expect(wrapper.text()).toContain('Order #1')
    expect(wrapper.text()).toContain('Alice Johnson')
    expect(wrapper.text()).toContain('Compounded Metformin')
  })

  it('renders customer contact and purchase history', async () => {
    vi.mocked(api.getCustomer).mockResolvedValue({ ...customer, orders: [order] })
    const wrapper = await mountAt(
      CustomerDetailsView,
      '/pharmacovigilance/customers/1',
      '/pharmacovigilance/customers/:customerId',
    )

    expect(api.getCustomer).toHaveBeenCalledWith(1)
    expect(wrapper.text()).toContain('alice@example.test')
    expect(wrapper.text()).toContain('Purchase history')
    expect(wrapper.text()).toContain('Lot 951357')
  })
})
