import { api } from "@/lib/api"
import type { IApiSuccess, ILoginDTO, ILoginResponse, IRegisterDTO, IUser } from "@/types"

export async function login(dto: ILoginDTO): Promise<ILoginResponse> {
  const res = await api.post<IApiSuccess<ILoginResponse>>("/auth/login", dto)
  return res.data.data
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout")
}

export async function me(): Promise<IUser> {
  const res = await api.get<IApiSuccess<IUser>>("/auth/me")
  return res.data.data
}

export async function register(dto: IRegisterDTO): Promise<IUser> {
  const res = await api.post<IApiSuccess<IUser>>("/auth/register", dto)
  return res.data.data
}
