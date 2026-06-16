"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as deliveryApi from "@/lib/api/delivery.api"
import type { IBulkDeliveryUpdateDTO, IDeliveryUpdateDTO } from "@/types"

export function useDeliveryHistory(orderId: string | undefined) {
  return useQuery({
    queryKey: ["delivery", orderId],
    queryFn: () => deliveryApi.getDeliveryHistory(orderId!),
    enabled: !!orderId,
  })
}

export function useInTransit() {
  return useQuery({
    queryKey: ["delivery", "in-transit"],
    queryFn: () => deliveryApi.getInTransit(),
    refetchInterval: 30_000,
  })
}

export function useBulkUpdateDelivery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: IBulkDeliveryUpdateDTO) =>
      deliveryApi.bulkUpdateDelivery(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useUpdateDeliveryStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, dto }: { orderId: string; dto: IDeliveryUpdateDTO }) =>
      deliveryApi.updateDeliveryStatus(orderId, dto),
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: ["order", orderId] })
      qc.invalidateQueries({ queryKey: ["delivery", orderId] })
      qc.invalidateQueries({ queryKey: ["delivery", "in-transit"] })
    },
  })
}
