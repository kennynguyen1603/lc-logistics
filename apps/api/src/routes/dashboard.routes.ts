import { Router } from "express"
import { z } from "zod"
import * as dashboardService from "../services/dashboard.service"
import { requireAuth, requireRole } from "../middleware/auth.middleware"
import { validate } from "../middleware/validator"
import { ok } from "../utils/response"

const router: Router = Router()

const summarySchema = z.object({
  period: z.enum(["today", "week", "month"]).optional(),
})
const daysSchema = z.object({
  days: z.coerce.number().int().min(7).max(30).optional(),
})

router.get(
  "/summary",
  requireAuth,
  requireRole("ADMIN"),
  validate(summarySchema, "query"),
  async (req, res, next) => {
    try {
      const period = (req.query.period as "today" | "week" | "month") ?? "week"
      const summary = await dashboardService.getSummary(period)
      ok(res, summary)
    } catch (err) {
      next(err)
    }
  }
)

router.get(
  "/orders-by-status",
  requireAuth,
  requireRole("ADMIN"),
  async (_req, res, next) => {
    try {
      const data = await dashboardService.getOrdersByStatus()
      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

router.get(
  "/orders-by-day",
  requireAuth,
  requireRole("ADMIN"),
  validate(daysSchema, "query"),
  async (req, res, next) => {
    try {
      const days = Number(req.query.days ?? 7)
      const data = await dashboardService.getOrdersByDay(days)
      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

router.get(
  "/low-stock",
  requireAuth,
  requireRole("ADMIN"),
  async (_req, res, next) => {
    try {
      const data = await dashboardService.getLowStockAlerts()
      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

router.get(
  "/recent-orders",
  requireAuth,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const limit = Math.min(50, Number(req.query.limit ?? 10))
      const data = await dashboardService.getRecentOrders(limit)
      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

export default router
