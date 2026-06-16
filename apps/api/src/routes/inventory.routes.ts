import { Router } from "express"
import { z } from "zod"
import type { IInventoryFilterQuery, IBulkAdjustDTO } from "@workspace/shared"
import * as inventoryService from "../services/inventory.service"
import { requireAuth, requireRole } from "../middleware/auth.middleware"
import { validate } from "../middleware/validator"
import { ok, apiError } from "../utils/response"

const router: Router = Router()

const filterSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  warehouseId: z.string().optional(),
  categoryId: z.string().optional(),
  lowStockOnly: z.coerce.boolean().optional(),
})

const adjustSchema = z.object({
  quantity: z
    .number()
    .int()
    .refine((v) => v !== 0, "Số lượng không được bằng 0"),
  reason: z.string().min(3),
  referenceNo: z.string().optional(),
})

const bulkAdjustSchema = z.object({
  adjustments: z
    .array(
      z.object({
        productId: z.string().min(1),
        warehouseId: z.string().min(1),
        quantity: z
          .number()
          .int()
          .refine((v) => v !== 0, "Số lượng không được bằng 0"),
        reason: z.string().min(3),
        referenceNo: z.string().optional(),
      })
    )
    .min(1)
    .max(100),
})

const movementsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  inventoryId: z.string().optional(),
})

router.get(
  "/",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(filterSchema, "query"),
  async (req, res, next) => {
    try {
      const { data, total } = await inventoryService.findAll(
        req.query as IInventoryFilterQuery
      )
      const page = Number(req.query.page ?? 1)
      const limit = Number(req.query.limit ?? 50)
      ok(res, data, {
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
  "/low-stock",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  async (_req, res, next) => {
    try {
      const alerts = await inventoryService.getLowStock()
      ok(res, alerts)
    } catch (err) {
      next(err)
    }
  }
)

router.get(
  "/movements",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(movementsSchema, "query"),
  async (req, res, next) => {
    try {
      const page = Number(req.query.page ?? 1)
      const limit = Number(req.query.limit ?? 50)
      const { data, total } = await inventoryService.getMovements(
        req.query.inventoryId as string | undefined,
        page,
        limit
      )
      ok(res, data, {
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
  "/:productId",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  async (req, res, next) => {
    try {
      const records = await inventoryService.findByProductId(
        req.params["productId"] as string
      )
      ok(res, records)
    } catch (err) {
      next(err)
    }
  }
)

router.patch(
  "/:productId/warehouse/:warehouseId",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(adjustSchema),
  async (req, res, next) => {
    try {
      const { quantity, reason, referenceNo } = req.body as {
        quantity: number
        reason: string
        referenceNo?: string
      }
      const updated = await inventoryService.adjustStock(
        req.params["productId"] as string,
        req.params["warehouseId"] as string,
        quantity,
        reason,
        referenceNo,
        req.user!.sub
      )
      ok(res, updated)
    } catch (err) {
      const e = err as { status?: number; code?: string; message?: string }
      if (e.status) return apiError(res, e.status, e.code!, e.message!)
      next(err)
    }
  }
)

router.post(
  "/bulk-adjust",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(bulkAdjustSchema),
  async (req, res, next) => {
    try {
      const result = await inventoryService.bulkAdjustStock(
        req.body as IBulkAdjustDTO,
        req.user!.sub
      )
      ok(res, result)
    } catch (err) {
      next(err)
    }
  }
)

export default router
