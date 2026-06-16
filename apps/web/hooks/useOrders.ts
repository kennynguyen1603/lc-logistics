"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as ordersApi from "@/lib/api/orders.api"
import type { IOrderCreateDTO, IOrderFilterQuery, IOrderUpdateDTO } from "@/types"

export function useOrders(query?: Partial<IOrderFilterQuery>) {
  return useQuery({
    queryKey: ["orders", query],
    queryFn: () => ordersApi.getOrders(query),
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.getOrderById(id!),
    enabled: !!id,
  })
}

export function useTrackOrder(trackingNo: string | undefined) {
  return useQuery({
    queryKey: ["track", trackingNo],
    queryFn: () => ordersApi.trackOrder(trackingNo!),
    enabled: !!trackingNo,
    retry: false,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: IOrderCreateDTO) => ordersApi.createOrder(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useUpdateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IOrderUpdateDTO }) =>
      ordersApi.updateOrder(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: ["order", id] })
    },
  })
}

export function useDeleteOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ordersApi.deleteOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
