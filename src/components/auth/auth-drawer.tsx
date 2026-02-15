"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useModal } from "@/contexts/modal-context"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

export function AuthDrawer() {
  const { isModalOpen, closeModal } = useModal()
  const [isLoginView, setIsLoginView] = useState(true)

  const handleSuccess = () => {
    closeModal()
  }

  return (
    <Sheet open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-center text-2xl">
            {isLoginView ? "Welcome Back" : "Create an Account"}
          </SheetTitle>
          <SheetDescription className="text-center">
            {isLoginView ? "Sign in to continue." : "Enter your details to register."}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8">
            {isLoginView ? <LoginForm onSuccess={handleSuccess} /> : <RegisterForm onSuccess={handleSuccess} />}
            <p className="text-center text-sm text-gray-600 mt-4">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
                onClick={() => setIsLoginView(!isLoginView)}
                className="font-medium text-primary hover:underline"
            >
                {isLoginView ? "Sign up" : "Sign in"}
            </button>
            </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
