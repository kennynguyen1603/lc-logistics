import jwt from "jsonwebtoken"
import type { IJwtPayload } from "@workspace/shared"
import { env } from "../config/env"

export function signToken(payload: Omit<IJwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  })
}

export function verifyToken(token: string): IJwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as IJwtPayload
}
