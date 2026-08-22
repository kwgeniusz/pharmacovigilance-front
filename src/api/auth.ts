import { http, initializeCsrf } from './http'
import type { ApiResource, User } from '@/types/api'

export async function login(username: string, password: string) {
  await initializeCsrf()
  const response = await http.post<ApiResource<User>>('/api/login', { username, password })
  await initializeCsrf()
  return response.data.data
}

export async function currentUser() {
  const response = await http.get<ApiResource<User>>('/api/user')
  return response.data.data
}

export async function logout() {
  await http.post('/api/logout')
}
