import type { IOrder, IOrderFilterQuery } from "@workspace/shared"
import { type Prisma } from "@prisma/client"
import { prisma } from "../utils/prisma"

const ORDER_INCLUDE = {
  customer: true,
  createdBy: { select: { id: true, fullName: true } },
  items: { include: { product: { include: { category: true } } } },
  shipments: {
    include: { carrier: true, legs: { orderBy: { sequence: "asc" as const } } },
  },
  deliveries: { orderBy: { createdAt: "asc" as const } },
} as const

export async function findByTrackingNo(
  trackingNo: string
): Promise<IOrder | null> {
  const order = await prisma.order.findUnique({
    where: { trackingNo },
    include: ORDER_INCLUDE,
  })
  return order ? toIOrder(order) : null
}

export async function findAll(
  filter: IOrderFilterQuery
): Promise<{ data: IOrder[]; total: number }> {
  const page = Math.max(1, filter.page ?? 1)
  const limit = Math.min(100, filter.limit ?? 20)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (filter.status) where["status"] = filter.status
  if (filter.customerId) where["customerId"] = filter.customerId
  if (filter.fromDate || filter.toDate) {
    where["createdAt"] = {
      ...(filter.fromDate ? { gte: new Date(filter.fromDate) } : {}),
      ...(filter.toDate ? { lte: new Date(filter.toDate) } : {}),
    }
  }
  if (filter.search) {
    where["OR"] = [
      { trackingNo: { contains: filter.search, mode: "insensitive" } },
      {
        customer: {
          fullName: { contains: filter.search, mode: "insensitive" },
        },
      },
    ]
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where }),
  ])

  return { data: orders.map(toIOrder), total }
}

export async function findById(id: string): Promise<IOrder | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: ORDER_INCLUDE,
  })
  return order ? toIOrder(order) : null
}

export async function create(
  dto: {
    customerId: string
    shippingAddress: string
    notes?: string
    items: { productId: string; quantity: number; unitPrice: number }[]
  },
  createdById: string
): Promise<IOrder> {
  const trackingNo = generateTrackingNo()
  const totalAmount = dto.items.reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0
  )

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        trackingNo,
        customerId: dto.customerId,
        createdById,
        totalAmount,
        shippingAddress: dto.shippingAddress,
        notes: dto.notes,
        items: {
          create: dto.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.quantity * i.unitPrice,
          })),
        },
      },
      include: ORDER_INCLUDE,
    })

    // Reserve inventory for each item
    for (const item of dto.items) {
      const inv = await tx.inventory.findFirst({
        where: { productId: item.productId },
      })
      if (inv) {
        await tx.inventory.update({
          where: { id: inv.id },
          data: { reserved: { increment: item.quantity } },
        })
      }
    }

    // Initial delivery log
    await tx.delivery.create({
      data: {
        orderId: created.id,
        status: "PENDING",
        note: "Đơn hàng được tạo",
        updatedBy: createdById,
      },
    })

    return created
  })

  return toIOrder(order)
}

export async function update(
  id: string,
  dto: { shippingAddress?: string; notes?: string }
): Promise<IOrder> {
  const order = await prisma.order.update({
    where: { id },
    data: dto,
    include: ORDER_INCLUDE,
  })
  return toIOrder(order)
}

export async function remove(id: string): Promise<void> {
  await prisma.order.delete({ where: { id } })
}

function generateTrackingNo(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, "")
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `VN${date}${rand}`
}

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>

function toIOrder(o: OrderWithRelations): IOrder {
  return {
    id: o.id,
    trackingNo: o.trackingNo,
    customer: {
      id: o.customer.id,
      fullName: o.customer.fullName,
      phone: o.customer.phone,
      email: o.customer.email,
    },
    createdBy: { id: o.createdBy.id, fullName: o.createdBy.fullName },
    status: o.status,
    totalAmount: o.totalAmount,
    currency: o.currency,
    shippingAddress: o.shippingAddress,
    notes: o.notes ?? undefined,
    items: o.items.map((i) => ({
      id: i.id,
      orderId: i.orderId,
      productId: i.productId,
      product: {
        id: i.product.id,
        sku: i.product.sku,
        name: i.product.name,
        unit: i.product.unit,
        hsCode: i.product.hsCode ?? undefined,
      },
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    })),
    shipments: o.shipments?.map((s) => ({
      id: s.id,
      orderId: s.orderId,
      carrier: {
        id: s.carrier.id,
        code: s.carrier.code,
        name: s.carrier.name,
        type: s.carrier.type,
      },
      shipmentNo: s.shipmentNo,
      mode: s.mode,
      origin: s.origin,
      destination: s.destination,
      etaDate: s.etaDate?.toISOString(),
      actualDate: s.actualDate?.toISOString(),
      cost: s.cost ?? undefined,
      legs: s.legs.map((l) => ({
        id: l.id,
        shipmentId: l.shipmentId,
        sequence: l.sequence,
        mode: l.mode,
        fromPoint: l.fromPoint,
        toPoint: l.toPoint,
        carrier: l.carrier ?? undefined,
        startTime: l.startTime?.toISOString(),
        endTime: l.endTime?.toISOString(),
        status: l.status,
      })),
      createdAt: s.createdAt.toISOString(),
    })),
    deliveries: o.deliveries?.map((d) => ({
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
  }
}
