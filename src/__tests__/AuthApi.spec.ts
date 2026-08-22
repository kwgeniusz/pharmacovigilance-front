import { beforeEach, describe, expect, it, vi } from 'vitest'
import { currentUser, login, logout } from '@/api/auth'
import { http, initializeCsrf } from '@/api/http'

vi.mock('@/api/http', () => ({
  initializeCsrf: vi.fn<(...args: never[]) => Promise<never>>(),
  http: {
    get: vi.fn<(...args: never[]) => Promise<never>>(),
    post: vi.fn<(...args: never[]) => Promise<never>>(),
  },
}))

describe('authentication API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('initializes CSRF before login and refreshes it after session regeneration', async () => {
    vi.mocked(http.post).mockResolvedValue({ data: { data: { id: 1, username: 'admin' } } })

    await expect(login('admin', 'password')).resolves.toEqual({ id: 1, username: 'admin' })

    expect(initializeCsrf).toHaveBeenCalledTimes(2)
    expect(http.post).toHaveBeenCalledWith('/api/login', {
      username: 'admin',
      password: 'password',
    })
  })

  it('loads the current user and closes the session', async () => {
    vi.mocked(http.get).mockResolvedValue({ data: { data: { id: 1, username: 'admin' } } })
    vi.mocked(http.post).mockResolvedValue({})

    await expect(currentUser()).resolves.toEqual({ id: 1, username: 'admin' })
    await logout()

    expect(http.get).toHaveBeenCalledWith('/api/user')
    expect(http.post).toHaveBeenCalledWith('/api/logout')
  })
})
