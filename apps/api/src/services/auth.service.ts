import type { IUser } from "@workspace/shared"
import { prisma } from "../utils/prisma"
import { hashPassword, comparePassword } from "../utils/password"
import { signToken } from "../utils/jwt"

export interface LoginResult {
  user: IUser
  token: string
  expiresAt: string
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user)
    throw Object.assign(new Error("Email hoặc mật khẩu không đúng"), {
      status: 401,
      code: "INVALID_CREDENTIALS",
    })

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid)
    throw Object.assign(new Error("Email hoặc mật khẩu không đúng"), {
      status: 401,
      code: "INVALID_CREDENTIALS",
    })

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role as IUser["role"],
  })

  return {
    user: toIUser(user),
    token,
    expiresAt,
  }
}

export async function register(dto: {
  email: string
  password: string
  fullName: string
  phone?: string
}): Promise<IUser> {
  const exists = await prisma.user.findUnique({ where: { email: dto.email } })
  if (exists)
    throw Object.assign(new Error("Email đã được sử dụng"), {
      status: 409,
      code: "CONFLICT",
    })

  const passwordHash = await hashPassword(dto.password)
  const user = await prisma.user.create({
    data: {
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone,
      role: "CUSTOMER",
    },
  })
  return toIUser(user)
}

export async function me(userId: string): Promise<IUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user)
    throw Object.assign(new Error("Không tìm thấy người dùng"), {
      status: 404,
      code: "NOT_FOUND",
    })
  return toIUser(user)
}

function toIUser(u: {
  id: string
  email: string
  fullName: string
  role: string
  phone: string | null
  createdAt: Date
  updatedAt: Date
}): IUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role as IUser["role"],
    phone: u.phone ?? undefined,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }
}
