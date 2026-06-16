import type {
  IInventory,
  ILowStockAlert,
  IStockMovement,
  IInventoryFilterQuery,
  IBulkAdjustDTO,
  IBulkAdjustResult,
} from "@workspace/shared"
import { prisma } from "../utils/prisma"

const INVENTORY_INCLUDE = {
  product: { include: { category: true } },
  warehouse: true,
} as const

export async function findAll(
  filter: IInventoryFilterQuery
): Promise<{ data: IInventory[]; total: number }> {
  const page = Math.max(1, filter.page ?? 1)
  const limit = Math.min(200, filter.limit ?? 50)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (filter.warehouseId) where["warehouseId"] = filter.warehouseId
  if (filter.categoryId) where["product"] = { categoryId: filter.categoryId }
  if (filter.lowStockOnly)
    where["AND"] = [{ stock: { lte: prisma.inventory.fields.lowThreshold } }]

  const [records, total] = await prisma.$transaction([
    prisma.inventory.findMany({
      where,
      skip,
      take: limit,
      include: INVENTORY_INCLUDE,
    }),
    prisma.inventory.count({ where }),
  ])

  // low stock filter in memory (Prisma can't compare two fields in sqlite/pg easily via where)
  const filtered = filter.lowStockOnly
    ? records.filter((r) => r.stock <= r.lowThreshold)
    : records

  return {
    data: filtered.map(toIInventory),
    total: filter.lowStockOnly ? filtered.length : total,
  }
}

export async function findByProductId(
  productId: string
): Promise<IInventory[]> {
  const records = await prisma.inventory.findMany({
    where: { productId },
    include: INVENTORY_INCLUDE,
  })
  return records.map(toIInventory)
}

export async function adjustStock(
  productId: string,
  warehouseId: string,
  quantity: number,
  reason: string,
  referenceNo: string | undefined,
  performedById: string
): Promise<IInventory> {
  const inv = await prisma.inventory.findUnique({
    where: { productId_warehouseId: { productId, warehouseId } },
  })
  if (!inv)
    throw Object.assign(new Error("Không tìm thấy bản ghi tồn kho"), {
      status: 404,
      code: "NOT_FOUND",
    })

  const type =
    quantity > 0 ? "INBOUND" : quantity < 0 ? "OUTBOUND" : "ADJUSTMENT"

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.inventory.update({
      where: { id: inv.id },
      data: { stock: { increment: quantity } },
      include: INVENTORY_INCLUDE,
    })
    await tx.stockMovement.create({
      data: {
        inventoryId: inv.id,
        type,
        quantity,
        reason,
        referenceNo,
        performedById,
      },
    })
    return result
  })

  return toIInventory(updated)
}

export async function bulkAdjustStock(
  dto: IBulkAdjustDTO,
  performedById: string
): Promise<IBulkAdjustResult> {
  const { adjustments } = dto
  const errors: IBulkAdjustResult["errors"] = []

  // Pre-fetch all inventory records to avoid N+1 inside transaction
  const inventories = await prisma.inventory.findMany({
    where: {
      OR: adjustments.map((a) => ({
        productId: a.productId,
        warehouseId: a.warehouseId,
      })),
    },
  })
  const invMap = new Map(
    inventories.map((i) => [`${i.productId}-${i.warehouseId}`, i])
  )

  let succeeded = 0

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < adjustments.length; i++) {
      const a = adjustments[i]!
      const inv = invMap.get(`${a.productId}-${a.warehouseId}`)
      if (!inv) {
        errors.push({ index: i, message: "Không tìm thấy bản ghi tồn kho" })
        continue
      }
      const type =
        a.quantity > 0 ? "INBOUND" : a.quantity < 0 ? "OUTBOUND" : "ADJUSTMENT"
      await tx.inventory.update({
        where: { id: inv.id },
        data: { stock: { increment: a.quantity } },
      })
      await tx.stockMovement.create({
        data: {
          inventoryId: inv.id,
          type,
          quantity: a.quantity,
          reason: a.reason,
          referenceNo: a.referenceNo,
          performedById,
        },
      })
      succeeded++
    }
  })

  return { succeeded, failed: errors.length, errors }
}

export async function getLowStock(): Promise<ILowStockAlert[]> {
  const records = await prisma.inventory.findMany({
    include: INVENTORY_INCLUDE,
  })
  return records
    .filter((r) => r.stock <= r.lowThreshold)
    .map((r) => ({
      productId: r.productId,
      productName: r.product.name,
      sku: r.product.sku,
      warehouseId: r.warehouseId,
      warehouseName: r.warehouse.name,
      currentStock: r.stock,
      threshold: r.lowThreshold,
    }))
}

export async function getMovements(
  inventoryId?: string,
  page = 1,
  limit = 50
): Promise<{ data: IStockMovement[]; total: number }> {
  const skip = (page - 1) * limit
  const where = inventoryId ? { inventoryId } : {}

  const [movements, total] = await prisma.$transaction([
    prisma.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        inventory: { include: { product: true, warehouse: true } },
        performedBy: { select: { id: true, fullName: true } },
      },
    }),
    prisma.stockMovement.count({ where }),
  ])

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: movements.map((m: any) => ({
      id: m.id,
      inventoryId: m.inventoryId,
      product: {
        id: m.inventory.product.id,
        sku: m.inventory.product.sku,
        name: m.inventory.product.name,
      },
      warehouse: {
        id: m.inventory.warehouse.id,
        code: m.inventory.warehouse.code,
        name: m.inventory.warehouse.name,
      },
      type: m.type,
      quantity: m.quantity,
      reason: m.reason,
      referenceNo: m.referenceNo ?? undefined,
      performedBy: m.performedBy
        ? { id: m.performedBy.id, fullName: m.performedBy.fullName }
        : undefined,
      createdAt: m.createdAt.toISOString(),
    })),
    total,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toIInventory(r: any): IInventory {
  return {
    id: r.id,
    productId: r.productId,
    product: {
      id: r.product.id,
      sku: r.product.sku,
      name: r.product.name,
      unit: r.product.unit,
    },
    warehouseId: r.warehouseId,
    warehouse: {
      id: r.warehouse.id,
      code: r.warehouse.code,
      name: r.warehouse.name,
      city: r.warehouse.city,
    },
    stock: r.stock,
    reserved: r.reserved,
    available: r.stock - r.reserved,
    lowThreshold: r.lowThreshold,
    updatedAt: r.updatedAt.toISOString(),
  }
}
