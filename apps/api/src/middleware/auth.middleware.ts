import type { NextFunction, Request, Response } from "express"
import type { IJwtPayload, Role } from "@workspace/shared"
import { verifyToken } from "../utils/jwt"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IJwtPayload
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.token as string | undefined
  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" },
    })
    return
  }
  try {
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json({
      success: false,
      error: { code: "TOKEN_EXPIRED", message: "Phiên đăng nhập đã hết hạn" },
    })
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Bạn không có quyền thực hiện thao tác này",
        },
      })
      return
    }
    next()
  }
}
