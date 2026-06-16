import { Router } from "express"
import { z } from "zod"
import * as authService from "../services/auth.service"
import { requireAuth } from "../middleware/auth.middleware"
import { authRateLimit } from "../middleware/rateLimit"
import { validate } from "../middleware/validator"
import { ok, created, apiError } from "../utils/response"
import { env } from "../config/env"

const router: Router = Router()

const isProd = env.NODE_ENV === "production"
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().optional(),
})

router.post(
  "/login",
  authRateLimit,
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body as {
        email: string
        password: string
      }
      const result = await authService.login(email, password)
      res.cookie("token", result.token, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
      })
      ok(res, { user: result.user, expiresAt: result.expiresAt })
    } catch (err) {
      const e = err as { status?: number; code?: string; message?: string }
      if (e.status) return apiError(res, e.status, e.code!, e.message!)
      next(err)
    }
  }
)

router.post(
  "/register",
  authRateLimit,
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const user = await authService.register(req.body)
      created(res, user)
    } catch (err) {
      const e = err as { status?: number; code?: string; message?: string }
      if (e.status) return apiError(res, e.status, e.code!, e.message!)
      next(err)
    }
  }
)

router.post("/logout", requireAuth, (_req, res) => {
  res.clearCookie("token", cookieOptions)
  ok(res, { message: "Đăng xuất thành công" })
})

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await authService.me(req.user!.sub)
    ok(res, user)
  } catch (err) {
    const e = err as { status?: number; code?: string; message?: string }
    if (e.status) return apiError(res, e.status, e.code!, e.message!)
    next(err)
  }
})

export default router
