import type { Response } from "express"
import type { IApiError, IApiSuccess, IPaginationMeta } from "@workspace/shared"

export function ok<T>(
  res: Response,
  data: T,
  meta?: IPaginationMeta
): Response {
  const body: IApiSuccess<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  }
  return res.status(200).json(body)
}

export function created<T>(res: Response, data: T): Response {
  const body: IApiSuccess<T> = { success: true, data }
  return res.status(201).json(body)
}

export function apiError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
): Response {
  const body: IApiError = {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  }
  return res.status(status).json(body)
}
