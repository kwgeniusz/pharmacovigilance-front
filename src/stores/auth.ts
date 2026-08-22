import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authApi from '@/api/auth'
import type { User } from '@/types/api'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const status = ref<AuthStatus>('idle')
  const initialized = computed(() => status.value !== 'idle' && status.value !== 'loading')
  const isAuthenticated = computed(() => status.value === 'authenticated')

  async function restoreSession() {
    if (initialized.value) return
    status.value = 'loading'

    try {
      user.value = await authApi.currentUser()
      status.value = 'authenticated'
    } catch {
      user.value = null
      status.value = 'guest'
    }
  }

  async function login(username: string, password: string) {
    status.value = 'loading'
    try {
      user.value = await authApi.login(username, password)
      status.value = 'authenticated'
    } catch (error) {
      user.value = null
      status.value = 'guest'
      throw error
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      markAsGuest()
    }
  }

  function markAsGuest() {
    user.value = null
    status.value = 'guest'
  }

  return { user, status, initialized, isAuthenticated, restoreSession, login, logout, markAsGuest }
})
