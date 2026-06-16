import type { NextFunction, Request, Response } from "express"
import { ZodSchema } from "zod"

export function validate(
  schema: ZodSchema,
  target: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Dữ liệu không hợp lệ",
          details: result.error.flatten().fieldErrors,
        },
      })
      return
    }
    req[target] = result.data
    next()
  }
}
