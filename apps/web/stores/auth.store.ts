"use client"

import { create } from "zustand"
import type { IUser, Role } from "@/types"

interface IAuthState {
  user: IUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: IUser) => void
}

// Mock credentials for demo
const MOCK_CREDENTIALS: Record<string, { password: string; user: IUser }> = {
  "admin@logistics.vn": {
    password: "admin123",
    user: { id: "u1", email: "admin@logistics.vn", name: "Nguyễn Văn Admin", role: "ADMIN", phone: "0901234567", createdAt: new Date("2025-01-01") },
  },
  "staff1@logistics.vn": {
    password: "staff123",
    user: { id: "u2", email: "staff1@logistics.vn", name: "Trần Thị Staff", role: "STAFF", phone: "0912345678", createdAt: new Date("2025-02-01") },
  },
}

export const useAuthStore = create<IAuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800))
    const creds = MOCK_CREDENTIALS[email]
    if (!creds || creds.password !== password) {
      set({ isLoading: false })
      throw new Error("Email hoặc mật khẩu không đúng")
    }
    set({ user: creds.user, isAuthenticated: true, isLoading: false })
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
  },

  setUser: (user: IUser) => {
    set({ user, isAuthenticated: true })
  },
}))
