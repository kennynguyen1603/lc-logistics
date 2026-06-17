import "dotenv/config"
import express, { Express } from "express"
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser"

import { env } from "./config/env"
import { logger } from "./utils/logger"
import { errorHandler } from "./middleware/errorHandler"

import authRoutes from "./routes/auth.routes"
import ordersRoutes from "./routes/orders.routes"
import deliveryRoutes from "./routes/delivery.routes"
import inventoryRoutes from "./routes/inventory.routes"
import productRoutes from "./routes/product.routes"
import warehouseRoutes from "./routes/warehouse.routes"
import dashboardRoutes from "./routes/dashboard.routes"
import customersRoutes from "./routes/customers.routes"

const app: Express = express()

// Render (and most PaaS) sit behind a reverse proxy that sets X-Forwarded-For.
// Trust one hop so express-rate-limit can read the real client IP.
if (env.NODE_ENV === "production") app.set("trust proxy", 1)

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  })
)

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() })
)

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes)
app.use("/api/orders", ordersRoutes)
app.use("/api/delivery", deliveryRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/products", productRoutes)
app.use("/api/warehouses", warehouseRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/customers", customersRoutes)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Endpoint không tồn tại" },
  })
})

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  logger.info(`API server running on http://localhost:${env.PORT}`)
})

export default app
