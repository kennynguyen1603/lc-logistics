import rateLimit from "express-rate-limit"

export const publicRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Quá nhiều request. Vui lòng thử lại sau 1 phút.",
    },
  },
})

export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau.",
    },
  },
})
