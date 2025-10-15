"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useModal } from "@/contexts/modal-context"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

export function AuthModal() {
  const { isModalOpen, closeModal } = useModal()
  const [isLoginView, setIsLoginView] = useState(true)

  const handleSuccess = () => {
    closeModal()
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-xl max-h-[80%] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {isLoginView ? "Welcome Back" : "Create an Account"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isLoginView ? "Sign in to continue." : "Enter your details to register."}
          </DialogDescription>
        </DialogHeader>
        {isLoginView ? <LoginForm onSuccess={handleSuccess} /> : <RegisterForm onSuccess={handleSuccess} />}
        <p className="text-center text-sm text-gray-600">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="font-medium text-primary hover:underline"
          >
            {isLoginView ? "Sign up" : "Sign in"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}