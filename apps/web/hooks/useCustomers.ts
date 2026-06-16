"use client"

import { useQuery } from "@tanstack/react-query"
import * as customersApi from "@/lib/api/customers.api"

export function useCustomers(query?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["customers", query],
    queryFn: () => customersApi.getCustomers(query),
  })
}
