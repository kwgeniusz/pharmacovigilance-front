import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

describe('LoginView', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('validates required credentials before submitting', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/login', name: 'login', component: LoginView }],
    })
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router] } })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('Username is required.')
    expect(wrapper.text()).toContain('Password is required.')
  })

  it('authenticates and redirects to the orders workspace', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', name: 'login', component: LoginView },
        { path: '/orders', name: 'orders', component: { template: '<div>Orders</div>' } },
      ],
    })
    await router.push('/login')
    await router.isReady()
    const auth = useAuthStore()
    auth.login = vi.fn<(username: string, password: string) => Promise<void>>().mockResolvedValue()
    const wrapper = mount(LoginView, { global: { plugins: [router] } })

    await wrapper.get('#username').setValue('admin')
    await wrapper.get('#password').setValue('password')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('orders'))

    expect(auth.login).toHaveBeenCalledWith('admin', 'password')
  })
})
