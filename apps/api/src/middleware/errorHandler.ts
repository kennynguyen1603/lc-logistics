import type { ErrorRequestHandler } from "express"
import { logger } from "../utils/logger"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error("Unhandled error", err)

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      error: { code: "INVALID_JSON", message: "Request body không hợp lệ" },
    })
    return
  }

  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Lỗi server nội bộ" },
  })
}
