import { Router } from "express"
import { z } from "zod"
import type { IBulkDeliveryUpdateDTO } from "@workspace/shared"
import * as deliveryService from "../services/delivery.service"
import { requireAuth, requireRole } from "../middleware/auth.middleware"
import { publicRateLimit } from "../middleware/rateLimit"
import { validate } from "../middleware/validator"
import { ok, apiError } from "../utils/response"

const router: Router = Router()

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
] as const

const updateStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  location: z.string().optional(),
  note: z.string().optional(),
})

const bulkUpdateSchema = z.object({
  updates: z
    .array(
      z.object({
        orderId: z.string().min(1),
        status: z.enum(ORDER_STATUSES),
        location: z.string().optional(),
        note: z.string().optional(),
      })
    )
    .min(1)
    .max(100),
})

router.post(
  "/bulk-update",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(bulkUpdateSchema),
  async (req, res, next) => {
    try {
      const result = await deliveryService.bulkUpdateStatus(
        req.body as IBulkDeliveryUpdateDTO,
        req.user!.sub
      )
      ok(res, result)
    } catch (err) {
      next(err)
    }
  }
)

// Public
router.get("/:orderId/history", publicRateLimit, async (req, res, next) => {
  try {
    const history = await deliveryService.getHistory(
      req.params["orderId"] as string
    )
    ok(res, history)
  } catch (err) {
    next(err)
  }
})

// Staff+
router.post(
  "/:orderId",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  validate(updateStatusSchema),
  async (req, res, next) => {
    try {
      const delivery = await deliveryService.updateStatus(
        req.params["orderId"] as string,
        req.body,
        req.user!.sub
      )
      ok(res, delivery)
    } catch (err) {
      const e = err as { status?: number; code?: string; message?: string }
      if (e.status) return apiError(res, e.status, e.code!, e.message!)
      next(err)
    }
  }
)

router.get(
  "/in-transit",
  requireAuth,
  requireRole("STAFF", "ADMIN"),
  async (_req, res, next) => {
    try {
      const orders = await deliveryService.getInTransit()
      ok(res, orders)
    } catch (err) {
      next(err)
    }
  }
)

export default router
