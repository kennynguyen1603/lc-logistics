import { Router } from "express"
import { z } from "zod"
import { prisma } from "../utils/prisma"
import { requireAuth, requireRole } from "../middleware/auth.middleware"
import { validate } from "../middleware/validator"
import { ok, created, apiError } from "../utils/response"

const router: Router = Router()

const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  unitPrice: z.number().positive(),
  unit: z.string().min(1),
  weight: z.number().positive().optional(),
  hsCode: z.string().optional(),
  imageUrl: z.string().url().optional(),
})

router.get(
  "/",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  async (req, res, next) => {
    try {
      const page = Math.max(1, Number(req.query.page ?? 1))
      const limit = Math.min(100, Number(req.query.limit ?? 50))
      const search = req.query.search as string | undefined

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { sku: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}

      const [products, total] = await prisma.$transaction([
        prisma.product.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: { category: true },
          orderBy: { name: "asc" },
        }),
        prisma.product.count({ where }),
      ])

      ok(
        res,
        products.map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          description: p.description ?? undefined,
          category: { id: p.category.id, name: p.category.name },
          unitPrice: p.unitPrice,
          unit: p.unit,
          weight: p.weight ?? undefined,
          hsCode: p.hsCode ?? undefined,
          imageUrl: p.imageUrl ?? undefined,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        })),
        { page, limit, total, totalPages: Math.ceil(total / limit) }
      )
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate(createProductSchema),
  async (req, res, next) => {
    try {
      const p = await prisma.product.create({
        data: req.body,
        include: { category: true },
      })
      created(res, {
        id: p.id,
        sku: p.sku,
        name: p.name,
        description: p.description ?? undefined,
        category: { id: p.category.id, name: p.category.name },
        unitPrice: p.unitPrice,
        unit: p.unit,
        weight: p.weight ?? undefined,
        hsCode: p.hsCode ?? undefined,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })
    } catch (err) {
      if ((err as { code?: string }).code === "P2002")
        return apiError(res, 409, "CONFLICT", "SKU đã tồn tại")
      next(err)
    }
  }
)

export default router
