export type UserRole = 'administrator' | 'operator'

export interface User {
  id: number
  username: string
  role: UserRole
}

export interface Medication {
  id: number
  name: string
  lot_number: string
}

export interface OrderItem {
  id: number
  medication: Medication
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  orders?: Order[]
}

export interface Order {
  id: number
  purchase_date: string
  customer: Customer
  items: OrderItem[]
}

export interface ApiResource<T> {
  data: T
}

export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface PaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  links: PaginationLink[]
  path: string
  per_page: number
  to: number | null
  total: number
}

export interface PaginatedResource<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta: PaginationMeta
}

export type FieldErrors = Record<string, string[]>

export interface ValidationErrorResponse {
  message: string
  errors: FieldErrors
}

export interface SearchFilters {
  lot_number: string
  start_date: string
  end_date: string
  page: number
}
