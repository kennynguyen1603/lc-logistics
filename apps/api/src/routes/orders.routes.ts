import { Router } from "express"
import { z } from "zod"
import type { IOrderFilterQuery } from "@workspace/shared"
import * as orderService from "../services/order.service"
import { requireAuth, requireRole } from "../middleware/auth.middleware"
import { publicRateLimit } from "../middleware/rateLimit"
import { validate } from "../middleware/validator"
import { ok, created, apiError } from "../utils/response"

const router: Router = Router()

const createOrderSchema = z.object({
  customerId: z.string().min(1),
  shippingAddress: z.string().min(5),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
      })
    )
    .min(1),
})

const updateOrderSchema = z.object({
  shippingAddress: z.string().min(5).optional(),
  notes: z.string().optional(),
})

const filterSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.string().optional(),
  customerId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  search: z.string().optional(),
})

// Public: track by trackingNo
router.get("/track/:trackingNo", publicRateLimit, async (req, res, next) => {
  try {
    const order = await orderService.findByTrackingNo(
      req.params["trackingNo"] as string
    )
    if (!order)
      return apiError(
        res,
        404,
        "NOT_FOUND",
        `Không tìm thấy đơn hàng ${req.params.trackingNo}`
      )
    ok(res, order)
  } catch (err) {
    next(err)
  }
})

// Staff+
router.get(
  "/",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(filterSchema, "query"),
  async (req, res, next) => {
    try {
      const { data, total } = await orderService.findAll(
        req.query as IOrderFilterQuery
      )
      const page = Number(req.query.page ?? 1)
      const limit = Number(req.query.limit ?? 20)
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
  "/:id",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  async (req, res, next) => {
    try {
      const order = await orderService.findById(req.params["id"] as string)
      if (!order)
        return apiError(res, 404, "NOT_FOUND", "Không tìm thấy đơn hàng")
      ok(res, order)
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  "/",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(createOrderSchema),
  async (req, res, next) => {
    try {
      const order = await orderService.create(req.body, req.user!.sub)
      created(res, order)
    } catch (err) {
      const e = err as { status?: number; code?: string; message?: string }
      if (e.status) return apiError(res, e.status, e.code!, e.message!)
      next(err)
    }
  }
)

router.patch(
  "/:id",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(updateOrderSchema),
  async (req, res, next) => {
    try {
      const order = await orderService.update(
        req.params["id"] as string,
        req.body
      )
      ok(res, order)
    } catch (err) {
      const e = err as { status?: number; code?: string; message?: string }
      if (e.status) return apiError(res, e.status, e.code!, e.message!)
      next(err)
    }
  }
)

// Admin only
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      await orderService.remove(req.params["id"] as string)
      ok(res, { message: "Đã xóa đơn hàng" })
    } catch (err) {
      const e = err as { status?: number; code?: string; message?: string }
      if (e.status) return apiError(res, e.status, e.code!, e.message!)
      next(err)
    }
  }
)

export default router
