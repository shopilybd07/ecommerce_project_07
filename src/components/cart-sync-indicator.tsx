"use client"

import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useHybridCart } from "@/contexts/hybrid-cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function CartSyncIndicator() {
  const { state, forceSync } = useHybridCart()
  const { state: authState } = useAuth()
  const isLoggedIn = !!authState.user

  if (!isLoggedIn || state.itemCount === 0) return null

  const getSyncStatus = () => {
    if (state.isSyncing) {
      return {
        icon: RefreshCw,
        color: "text-blue-500",
        message: "Syncing cart...",
        animate: "animate-spin",
      }
    }

    if (state.lastSyncTime) {
      const timeSinceSync = Date.now() - state.lastSyncTime
      const isRecent = timeSinceSync < 30000 // 30 seconds

      return {
        icon: Wifi,
        color: isRecent ? "text-green-500" : "text-yellow-500",
        message: isRecent ? "Cart synced" : "Sync may be outdated",
        animate: "",
      }
    }

    return {
      icon: WifiOff,
      color: "text-red-500",
      message: "Cart not synced",
      animate: "",
    }
  }

  const { icon: Icon, color, message, animate } = getSyncStatus()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={forceSync} disabled={state.isSyncing}>
            <Icon className={`h-3 w-3 ${color} ${animate}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
          {!state.isSyncing && <p className="text-xs opacity-75">Click to sync</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
