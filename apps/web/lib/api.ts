import axios from "axios"

export const api = axios.create({
  baseURL: (process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:8080") + "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.response.use(
  undefined,
  (error) => {
    const data = error.response?.data
    const message: string = data?.error?.message ?? "Lỗi kết nối mạng"
    const code: string = data?.error?.code ?? "NETWORK_ERROR"
    const status: number = error.response?.status ?? 0
    const err = new Error(message) as Error & { code: string; status: number }
    err.code = code
    err.status = status
    return Promise.reject(err)
  }
)
