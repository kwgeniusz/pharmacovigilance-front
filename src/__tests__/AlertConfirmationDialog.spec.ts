import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import AlertConfirmationDialog from '@/components/AlertConfirmationDialog.vue'
import type { Order } from '@/types/api'

const order: Order = {
  id: 1,
  purchase_date: '2026-08-12',
  customer: { id: 1, name: 'Alice Johnson', email: 'alice@example.test', phone: '+1 555 010 1001' },
  items: [{ id: 1, medication: { id: 1, name: 'Compounded Metformin', lot_number: '951357' } }],
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn<(this: HTMLDialogElement) => void>(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn<(this: HTMLDialogElement) => void>(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute('open')
  })
})

describe('AlertConfirmationDialog', () => {
  it('summarizes the recipient and emits confirmation', async () => {
    const wrapper = mount(AlertConfirmationDialog, {
      props: { open: true, order, lotNumber: '951357', sending: false, error: '' },
      attachTo: document.body,
    })

    expect(wrapper.text()).toContain('Alice Johnson')
    expect(wrapper.text()).toContain('alice@example.test')
    expect(wrapper.text()).toContain('951357')
    await wrapper.get('.button--warning').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    wrapper.unmount()
  })

  it('disables actions while an email is being sent', () => {
    const wrapper = mount(AlertConfirmationDialog, {
      props: { open: true, order, lotNumber: '951357', sending: true, error: '' },
    })

    expect(wrapper.get('.button--warning').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Sending…')
  })
})
