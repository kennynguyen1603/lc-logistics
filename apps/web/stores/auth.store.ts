"use client"

import { create } from "zustand"
import type { IUser } from "@/types"
import * as authApi from "@/lib/api/auth.api"

interface IAuthState {
  user: IUser | null
  isAuthenticated: boolean
  isChecking: boolean   // checking existing session on app load
  isLoading: boolean    // actively performing login action
  initAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: IUser) => void
}

export const useAuthStore = create<IAuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isChecking: true,   // true until initAuth completes
  isLoading: false,   // false until user clicks login

  initAuth: async () => {
    try {
      const user = await authApi.me()
      set({ user, isAuthenticated: true, isChecking: false })
    } catch {
      set({ user: null, isAuthenticated: false, isChecking: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { user } = await authApi.login({ email, password })
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore network errors on logout
    }
    set({ user: null, isAuthenticated: false })
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
}))
