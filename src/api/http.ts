import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import type { FieldErrors, ValidationErrorResponse } from '@/types/api'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const http = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
})

let handleUnauthorized: (() => void) | undefined

export function registerUnauthorizedHandler(handler: () => void) {
  handleUnauthorized = handler
}

export async function initializeCsrf() {
  await http.get('/sanctum/csrf-cookie')
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (AxiosRequestConfig & { csrfRetried?: boolean }) | undefined

    if (error.response?.status === 419 && config && !config.csrfRetried) {
      config.csrfRetried = true
      await initializeCsrf()
      return http.request(config)
    }

    if (error.response?.status === 401) {
      handleUnauthorized?.()
    }

    return Promise.reject(error)
  },
)

export function getFieldErrors(error: unknown): FieldErrors {
  if (!axios.isAxiosError<ValidationErrorResponse>(error) || error.response?.status !== 422) {
    return {}
  }

  return error.response.data.errors ?? {}
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<{ message?: string }>(error)) return fallback
  return error.response?.data.message ?? fallback
}
