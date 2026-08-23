import { http } from './http'
import type {
  ApiResource,
  Customer,
  Medication,
  Order,
  PaginatedResource,
  SearchFilters,
} from '@/types/api'

export async function searchMedications(lotNumber: string) {
  const response = await http.get<ApiResource<Medication[]>>('/api/medications/search', {
    params: { lot_number: lotNumber },
  })
  return response.data.data
}

export async function searchOrders(filters: SearchFilters) {
  const response = await http.get<PaginatedResource<Order>>('/api/orders', {
    params: {
      ...(filters.lot_number && { lot_number: filters.lot_number }),
      ...(filters.start_date && { start_date: filters.start_date }),
      ...(filters.end_date && { end_date: filters.end_date }),
      ...(filters.page > 1 && { page: filters.page }),
    },
  })
  return response.data
}

export async function exportOrders(filters: SearchFilters) {
  const response = await http.get<Blob>('/api/orders/export', {
    params: {
      ...(filters.lot_number && { lot_number: filters.lot_number }),
      ...(filters.start_date && { start_date: filters.start_date }),
      ...(filters.end_date && { end_date: filters.end_date }),
    },
    responseType: 'blob',
  })

  return response.data
}

export async function getOrder(orderId: number) {
  const response = await http.get<ApiResource<Order>>(`/api/orders/${orderId}`)
  return response.data.data
}

export async function getCustomer(customerId: number) {
  const response = await http.get<ApiResource<Customer>>(`/api/customers/${customerId}`)
  return response.data.data
}

export async function sendBuyerAlert(orderId: number, lotNumber: string) {
  const response = await http.post<{ message: string }>('/api/alerts/send', {
    order_id: orderId,
    lot_number: lotNumber,
  })
  return response.data
}
