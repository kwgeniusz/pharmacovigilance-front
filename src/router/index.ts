import { createRouter, createWebHistory } from 'vue-router'
import AppShell from '@/components/AppShell.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'orders' } },
    {
      path: '/pharmacovigilance/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/pharmacovigilance',
      component: AppShell,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'orders' } },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/views/OrdersView.vue'),
        },
        {
          path: 'orders/:orderId',
          name: 'order-details',
          component: () => import('@/views/OrderDetailsView.vue'),
        },
        {
          path: 'customers/:customerId',
          name: 'customer-details',
          component: () => import('@/views/CustomerDetailsView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.restoreSession()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'orders' }
  }
})

export default router
