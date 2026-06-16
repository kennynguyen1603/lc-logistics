import type {
  IDelivery,
  IOrder,
  OrderStatus,
  IBulkDeliveryUpdateDTO,
  IBulkDeliveryUpdateResult,
} from "@workspace/shared"
import { prisma } from "../utils/prisma"

const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
]

export async function getHistory(orderId: string): Promise<IDelivery[]> {
  const deliveries = await prisma.delivery.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  })
  return deliveries.map((d) => ({
    id: d.id,
    orderId: d.orderId,
    status: d.status as OrderStatus,
    location: d.location ?? undefined,
    note: d.note ?? undefined,
    updatedBy: d.updatedBy ?? undefined,
    createdAt: d.createdAt.toISOString(),
  }))
}

export async function updateStatus(
  orderId: string,
  dto: { status: OrderStatus; location?: string; note?: string },
  updatedBy: string
): Promise<IDelivery> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })
  if (!order)
    throw Object.assign(new Error("Không tìm thấy đơn hàng"), {
      status: 404,
      code: "NOT_FOUND",
    })

  const delivery = await prisma.$transaction(async (tx) => {
    const newDelivery = await tx.delivery.create({
      data: {
        orderId,
        status: dto.status,
        location: dto.location,
        note: dto.note,
        updatedBy,
      },
    })

    await tx.order.update({
      where: { id: orderId },
      data: { status: dto.status },
    })

    // Auto OUTBOUND stock movement when order enters transit
    if (dto.status === "IN_TRANSIT" && order.status !== "IN_TRANSIT") {
      for (const item of order.items) {
        const inv = await tx.inventory.findFirst({
          where: { productId: item.productId },
        })
        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: {
              stock: { decrement: item.quantity },
              reserved: { decrement: item.quantity },
            },
          })
          await tx.stockMovement.create({
            data: {
              inventoryId: inv.id,
              type: "OUTBOUND",
              quantity: item.quantity,
              reason: `Xuất kho cho đơn hàng ${order.trackingNo}`,
              referenceNo: order.trackingNo,
              performedById: updatedBy,
            },
          })
        }
      }
    }

    return newDelivery
  })

  return {
    id: delivery.id,
    orderId: delivery.orderId,
    status: delivery.status as OrderStatus,
    location: delivery.location ?? undefined,
    note: delivery.note ?? undefined,
    updatedBy: delivery.updatedBy ?? undefined,
    createdAt: delivery.createdAt.toISOString(),
  }
}

export async function bulkUpdateStatus(
  dto: IBulkDeliveryUpdateDTO,
  updatedBy: string
): Promise<IBulkDeliveryUpdateResult> {
  const { updates } = dto
  const errors: IBulkDeliveryUpdateResult["errors"] = []

  // Pre-fetch all orders with items
  const orders = await prisma.order.findMany({
    where: { id: { in: updates.map((u) => u.orderId) } },
    include: { items: true },
  })
  const orderMap = new Map(orders.map((o) => [o.id, o]))

  let succeeded = 0

  await prisma.$transaction(async (tx) => {
    for (const u of updates) {
      const order = orderMap.get(u.orderId)
      if (!order) {
        errors.push({ orderId: u.orderId, message: "Không tìm thấy đơn hàng" })
        continue
      }

      await tx.delivery.create({
        data: {
          orderId: u.orderId,
          status: u.status,
          location: u.location,
          note: u.note,
          updatedBy,
        },
      })

      await tx.order.update({
        where: { id: u.orderId },
        data: { status: u.status },
      })

      if (u.status === "IN_TRANSIT" && order.status !== "IN_TRANSIT") {
        for (const item of order.items) {
          const inv = await tx.inventory.findFirst({
            where: { productId: item.productId },
          })
          if (inv) {
            await tx.inventory.update({
              where: { id: inv.id },
              data: {
                stock: { decrement: item.quantity },
                reserved: { decrement: item.quantity },
              },
            })
            await tx.stockMovement.create({
              data: {
                inventoryId: inv.id,
                type: "OUTBOUND",
                quantity: item.quantity,
                reason: `Xuất kho cho đơn hàng ${order.trackingNo}`,
                referenceNo: order.trackingNo,
                performedById: updatedBy,
              },
            })
          }
        }
      }

      succeeded++
    }
  })

  return { succeeded, failed: errors.length, errors }
}

export async function getInTransit(): Promise<Partial<IOrder>[]> {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["IN_TRANSIT", "OUT_FOR_DELIVERY"] } },
    include: {
      customer: true,
      deliveries: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  })

  return orders.map((o) => ({
    id: o.id,
    trackingNo: o.trackingNo,
    status: o.status,
    customer: {
      id: o.customer.id,
      fullName: o.customer.fullName,
      phone: o.customer.phone,
      email: o.customer.email,
    },
    shippingAddress: o.shippingAddress,
    totalAmount: o.totalAmount,
    currency: o.currency,
    deliveries: o.deliveries.map((d) => ({
      id: d.id,
      orderId: d.orderId,
      status: d.status,
      location: d.location ?? undefined,
      note: d.note ?? undefined,
      updatedBy: d.updatedBy ?? undefined,
      createdAt: d.createdAt.toISOString(),
    })),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }))
}

export { ORDER_STATUS_SEQUENCE }
