"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as inventoryApi from "@/lib/api/inventory.api"
import type { IBulkAdjustDTO, IInventoryFilterQuery, IStockAdjustDTO } from "@/types"

export function useInventory(query?: Partial<IInventoryFilterQuery>) {
  return useQuery({
    queryKey: ["inventory", query],
    queryFn: () => inventoryApi.getInventory(query),
  })
}

export function useLowStock() {
  return useQuery({
    queryKey: ["inventory", "low-stock"],
    queryFn: () => inventoryApi.getLowStock(),
    refetchInterval: 60_000,
  })
}

export function useMovements(query?: {
  page?: number
  limit?: number
  inventoryId?: string
}) {
  return useQuery({
    queryKey: ["movements", query],
    queryFn: () => inventoryApi.getMovements(query),
  })
}

export function useBulkAdjustStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: IBulkAdjustDTO) => inventoryApi.bulkAdjust(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] })
      qc.invalidateQueries({ queryKey: ["movements"] })
    },
  })
}

export function useAdjustStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      warehouseId,
      dto,
    }: {
      productId: string
      warehouseId: string
      dto: IStockAdjustDTO
    }) => inventoryApi.adjustStock(productId, warehouseId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] })
      qc.invalidateQueries({ queryKey: ["movements"] })
    },
  })
}
