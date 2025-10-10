"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useModal } from "@/contexts/modal-context"
import { AuthForm } from "./auth-form"

export function AuthModal() {
  const { isModalOpen, closeModal } = useModal()

  const handleSuccess = () => {
    closeModal()
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Welcome</DialogTitle>
          <DialogDescription className="text-center">
            Sign in or create an account to continue.
          </DialogDescription>
        </DialogHeader>
        <AuthForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}