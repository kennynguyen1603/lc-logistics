import { api } from "@/lib/api"
import type { IApiSuccess, ICustomer, IPaginationMeta } from "@/types"

export async function getCustomers(query?: {
  search?: string
  page?: number
  limit?: number
}): Promise<{ data: ICustomer[]; meta: IPaginationMeta }> {
  const res = await api.get<IApiSuccess<ICustomer[]>>("/customers", { params: query })
  return { data: res.data.data, meta: res.data.meta! }
}

export async function getCustomerById(id: string): Promise<ICustomer> {
  const res = await api.get<IApiSuccess<ICustomer>>(`/customers/${id}`)
  return res.data.data
}
