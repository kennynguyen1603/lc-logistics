import { Router } from "express"
import { z } from "zod"
import { prisma } from "../utils/prisma"
import { requireAuth, requireRole } from "../middleware/auth.middleware"
import { validate } from "../middleware/validator"
import { ok, created, apiError } from "../utils/response"

const router: Router = Router()

const createWarehouseSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(5),
  city: z.string().min(1),
  type: z.enum(["GENERAL", "BONDED", "CFS", "ICD", "COLD_STORAGE"]).optional(),
})

router.get(
  "/",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  async (_req, res, next) => {
    try {
      const warehouses = await prisma.warehouse.findMany({
        orderBy: { name: "asc" },
      })
      ok(
        res,
        warehouses.map((w) => ({
          id: w.id,
          code: w.code,
          name: w.name,
          address: w.address,
          city: w.city,
          type: w.type,
          createdAt: w.createdAt.toISOString(),
        }))
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
  validate(createWarehouseSchema),
  async (req, res, next) => {
    try {
      const w = await prisma.warehouse.create({ data: req.body })
      created(res, {
        id: w.id,
        code: w.code,
        name: w.name,
        address: w.address,
        city: w.city,
        type: w.type,
        createdAt: w.createdAt.toISOString(),
      })
    } catch (err) {
      if ((err as { code?: string }).code === "P2002")
        return apiError(res, 409, "CONFLICT", "Mã kho đã tồn tại")
      next(err)
    }
  }
)

export default router
