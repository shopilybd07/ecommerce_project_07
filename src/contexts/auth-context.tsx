"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  createUser,
  getUserByEmail,
  getUserOrders,
  setAuthCookie,
  getAuthCookie,
  clearAuthCookie,
  type User,
  type Order,
} from "@/lib/auth-api"

interface AuthState {
  user: User | null
  orders: Order[]
  isLoading: boolean
}

interface AuthContextType {
  state: AuthState
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (data: {
    name: string
    email: string
    password: string
    phone: string
    username?: string
    address: string
    city: string
    zipCode: string
    country: string
    district: string
  }) => Promise<boolean>
  refreshOrders: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    orders: [],
    isLoading: true,
  })

  useEffect(() => {
    // Check for saved user in cookie
    const checkAuth = async () => {
      try {
        const user = await getAuthCookie()
        if (user) {
          // const orders = await getUserOrders(user.id)
          const orders: Order[] = [] // Mock orders
          setState({
            user,
            orders,
            isLoading: false,
          })
        } else {
          setState((prev) => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, you would validate password here
      const user = await getUserByEmail(email)

      if (user) {
        const orders = await getUserOrders(user.id)
        await setAuthCookie(user)

        setState({
          user,
          orders,
          isLoading: false,
        })
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (data: {
    name: string
    email: string
    password: string
    phone: string
    username?: string
    address: string
    city: string
    zipCode: string
    country: string
  }): Promise<boolean> => {
    try {
      const user = await createUser(data)

      if (user) {
        await setAuthCookie(user)

        setState({
          user,
          orders: [],
          isLoading: false,
        })
        return true
      }
      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await clearAuthCookie()
      setState({
        user: null,
        orders: [],
        isLoading: false,
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const refreshOrders = async () => {
    if (state.user) {
      try {
        const orders = await getUserOrders(state.user.id)
        setState((prev) => ({ ...prev, orders }))
      } catch (error) {
        console.error("Error refreshing orders:", error)
      }
    }
  }

  return (
    <AuthContext.Provider value={{ state, login, logout, register, refreshOrders }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
