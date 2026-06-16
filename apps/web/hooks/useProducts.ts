"use client"

import { useQuery } from "@tanstack/react-query"
import * as productsApi from "@/lib/api/products.api"

export function useProducts(query?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["products", query],
    queryFn: () => productsApi.getProducts(query),
  })
}
