import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/stores/auth'
import * as authApi from '@/api/auth'

vi.mock('@/api/auth', () => ({
  currentUser: vi.fn<(...args: never[]) => Promise<never>>(),
  login: vi.fn<(...args: never[]) => Promise<never>>(),
  logout: vi.fn<(...args: never[]) => Promise<never>>(),
}))

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('restores an authenticated session once', async () => {
    vi.mocked(authApi.currentUser).mockResolvedValue({ id: 1, username: 'admin' })
    const auth = useAuthStore()

    await auth.restoreSession()
    await auth.restoreSession()

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user?.username).toBe('admin')
    expect(authApi.currentUser).toHaveBeenCalledTimes(1)
  })

  it('marks the user as guest when session restoration fails', async () => {
    vi.mocked(authApi.currentUser).mockRejectedValue(new Error('Unauthenticated'))
    const auth = useAuthStore()

    await auth.restoreSession()

    expect(auth.status).toBe('guest')
    expect(auth.user).toBeNull()
  })
})
