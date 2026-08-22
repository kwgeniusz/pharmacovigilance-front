import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { http, registerUnauthorizedHandler } from '@/api/http'

const originalAdapter = http.defaults.adapter

function response(config: InternalAxiosRequestConfig, status = 200): AxiosResponse {
  return { data: {}, status, statusText: 'OK', headers: {}, config }
}

function rejection(config: InternalAxiosRequestConfig, status: number) {
  return new AxiosError(
    `HTTP ${status}`,
    'ERR_BAD_REQUEST',
    config,
    undefined,
    response(config, status),
  )
}

afterEach(() => {
  http.defaults.adapter = originalAdapter
  registerUnauthorizedHandler(() => undefined)
})

describe('HTTP client interceptors', () => {
  it('refreshes CSRF and retries a failed request once after a 419', async () => {
    const urls: string[] = []
    let protectedAttempts = 0
    const adapter: AxiosAdapter = async (config) => {
      urls.push(config.url ?? '')
      if (config.url === '/sanctum/csrf-cookie') return response(config, 204)
      protectedAttempts += 1
      if (protectedAttempts === 1) throw rejection(config, 419)
      return response(config)
    }
    http.defaults.adapter = adapter

    await expect(http.post('/api/alerts/send')).resolves.toMatchObject({ status: 200 })
    expect(urls).toEqual(['/api/alerts/send', '/sanctum/csrf-cookie', '/api/alerts/send'])
  })

  it('notifies the application when the API returns 401', async () => {
    const unauthorized = vi.fn<() => void>()
    registerUnauthorizedHandler(unauthorized)
    http.defaults.adapter = async (config) => {
      throw rejection(config, 401)
    }

    await expect(http.get('/api/user')).rejects.toBeInstanceOf(AxiosError)
    expect(unauthorized).toHaveBeenCalledOnce()
  })
})
