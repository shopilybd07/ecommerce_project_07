"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  syncCartToBackend,
  addItemToBackendCart,
  updateItemInBackendCart,
  removeItemFromBackendCart,
  clearBackendCart,
  mergeCartsOnLogin,
  type CartItem,
  type CartData,
} from "@/lib/cart-api"

interface CartState extends CartData {
  isOpen: boolean
  isSyncing: boolean
  lastSyncTime: number | null
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "SET_CART_DATA"; payload: CartData }
  | { type: "SET_SYNCING"; payload: boolean }
  | { type: "SET_LAST_SYNC_TIME"; payload: number | null }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  syncWithBackend: () => Promise<void>
  forceSync: () => Promise<void>
} | null>(null)

const STORAGE_KEY = "hybrid-cart"
const SYNC_DEBOUNCE_MS = 1000 // Wait 1 second before syncing to backend

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
      }

      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
        isOpen: true,
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      }
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: action.payload.id })
      }

      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )
      const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      }
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      }

    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      }

    case "OPEN_CART":
      return {
        ...state,
        isOpen: true,
      }

    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      }

    case "SET_CART_DATA":
      return {
        ...state,
        ...action.payload,
      }

    case "SET_SYNCING":
      return {
        ...state,
        isSyncing: action.payload,
      }

    case "SET_LAST_SYNC_TIME":
      return {
        ...state,
        lastSyncTime: action.payload,
      }

    default:
      return state
  }
}

export function HybridCartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    total: 0,
    itemCount: 0,
    isSyncing: false,
    lastSyncTime: null,
  })

  const { state: authState } = useAuth()
  const isLoggedIn = !!authState.user

  // Save to localStorage whenever cart changes
  useEffect(() => {
    const cartData: CartData = {
      items: state.items,
      total: state.total,
      itemCount: state.itemCount,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartData))
  }, [state.items, state.total, state.itemCount])

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY)
    if (savedCart) {
      try {
        const cartData: CartData = JSON.parse(savedCart)
        dispatch({ type: "SET_CART_DATA", payload: cartData })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Sync with backend (debounced)
  const syncWithBackend = useCallback(async () => {
    if (!isLoggedIn || !authState.user) return

    try {
      dispatch({ type: "SET_SYNCING", payload: true })

      const cartData: CartData = {
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }

      const success = await syncCartToBackend(authState.user.id, cartData)

      if (success) {
        dispatch({ type: "SET_LAST_SYNC_TIME", payload: Date.now() })
      }
    } catch (error) {
      console.error("Error syncing cart with backend:", error)
    } finally {
      dispatch({ type: "SET_SYNCING", payload: false })
    }
  }, [isLoggedIn, authState.user, state.items, state.total, state.itemCount])

  // Force immediate sync
  const forceSync = useCallback(async () => {
    await syncWithBackend()
  }, [syncWithBackend])

  // Debounced sync effect
  useEffect(() => {
    if (!isLoggedIn) return

    const timeoutId = setTimeout(() => {
      syncWithBackend()
    }, SYNC_DEBOUNCE_MS)

    return () => clearTimeout(timeoutId)
  }, [state.items, isLoggedIn, syncWithBackend])

  // Handle login - merge carts
  useEffect(() => {
    const handleLogin = async () => {
      if (!isLoggedIn || !authState.user) return

      try {
        dispatch({ type: "SET_SYNCING", payload: true })

        const localCartData: CartData = {
          items: state.items,
          total: state.total,
          itemCount: state.itemCount,
        }

        // Merge local cart with backend cart
        const mergedCart = await mergeCartsOnLogin(authState.user.id, localCartData)

        // Update local state with merged cart
        dispatch({ type: "SET_CART_DATA", payload: mergedCart })
        dispatch({ type: "SET_LAST_SYNC_TIME", payload: Date.now() })
      } catch (error) {
        console.error("Error merging carts on login:", error)
      } finally {
        dispatch({ type: "SET_SYNCING", payload: false })
      }
    }

    // Only run merge on login (when user becomes available)
    if (isLoggedIn && authState.user && !state.lastSyncTime) {
      handleLogin()
    }
  }, [isLoggedIn, authState.user, state.items, state.total, state.itemCount, state.lastSyncTime])

  // Handle logout - keep local cart but clear sync time
  useEffect(() => {
    if (!isLoggedIn) {
      dispatch({ type: "SET_LAST_SYNC_TIME", payload: null })
    }
  }, [isLoggedIn])

  // Enhanced dispatch that handles backend sync for individual operations
  const enhancedDispatch = useCallback(
    async (action: CartAction) => {
      // Apply action locally first (for immediate UI feedback)
      dispatch(action)

      // If user is logged in, sync specific operations to backend
      if (isLoggedIn && authState.user) {
        try {
          switch (action.type) {
            case "ADD_ITEM":
              await addItemToBackendCart(authState.user.id, { ...action.payload, quantity: 1 })
              break
            case "REMOVE_ITEM":
              await removeItemFromBackendCart(authState.user.id, action.payload)
              break
            case "UPDATE_QUANTITY":
              await updateItemInBackendCart(authState.user.id, action.payload.id, action.payload.quantity)
              break
            case "CLEAR_CART":
              await clearBackendCart(authState.user.id)
              break
          }
          dispatch({ type: "SET_LAST_SYNC_TIME", payload: Date.now() })
        } catch (error) {
          console.error("Error syncing individual operation to backend:", error)
          // Local state is already updated, so we don't revert
          // The debounced sync will eventually fix any inconsistencies
        }
      }
    },
    [isLoggedIn, authState.user],
  )

  return (
    <CartContext.Provider value={{ state, dispatch: enhancedDispatch, syncWithBackend, forceSync }}>
      {children}
    </CartContext.Provider>
  )
}

export function useHybridCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useHybridCart must be used within a HybridCartProvider")
  }
  return context
}
