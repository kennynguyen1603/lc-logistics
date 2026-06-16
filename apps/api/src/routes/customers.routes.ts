import { Router } from "express"
import { z } from "zod"
import { prisma } from "../utils/prisma"
import { requireAuth, requireRole } from "../middleware/auth.middleware"
import { validate } from "../middleware/validator"
import { ok, apiError } from "../utils/response"

const router: Router = Router()

const listSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
})

const mapCustomer = (c: {
  id: string
  fullName: string
  email: string
  phone: string
  createdAt: Date
  addresses: {
    id: string
    customerId: string
    line1: string
    ward: string | null
    district: string
    city: string
    country: string
    postalCode: string | null
    isDefault: boolean
  }[]
}) => ({
  id: c.id,
  fullName: c.fullName,
  email: c.email,
  phone: c.phone,
  createdAt: c.createdAt.toISOString(),
  addresses: c.addresses.map((a) => ({
    id: a.id,
    customerId: a.customerId,
    line1: a.line1,
    ward: a.ward ?? undefined,
    district: a.district,
    city: a.city,
    country: a.country,
    postalCode: a.postalCode ?? undefined,
    isDefault: a.isDefault,
  })),
})

router.get(
  "/",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(listSchema, "query"),
  async (req, res, next) => {
    try {
      const search = req.query.search as string | undefined
      const page = Math.max(1, Number(req.query.page ?? 1))
      const limit = Math.min(100, Number(req.query.limit ?? 20))

      const where = search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search } },
            ],
          }
        : {}

      const [customers, total] = await prisma.$transaction([
        prisma.customer.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: { addresses: true },
          orderBy: { fullName: "asc" },
        }),
        prisma.customer.count({ where }),
      ])

      ok(res, customers.map(mapCustomer), {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    } catch (err) {
      next(err)
    }
  }
)

router.get(
  "/:id",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  async (req, res, next) => {
    try {
      const c = await prisma.customer.findUnique({
        where: { id: req.params["id"] as string },
        include: { addresses: true },
      })
      if (!c) return apiError(res, 404, "NOT_FOUND", "Không tìm thấy khách hàng")
      ok(res, mapCustomer(c))
    } catch (err) {
      next(err)
    }
  }
)

export default router
