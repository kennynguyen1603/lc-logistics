"use client"

import { useQuery } from "@tanstack/react-query"
import * as warehousesApi from "@/lib/api/warehouses.api"

export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: () => warehousesApi.getWarehouses(),
    staleTime: 5 * 60_000,
  })
}
