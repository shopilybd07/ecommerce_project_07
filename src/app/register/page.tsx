"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 mb-2">
            <ShoppingBag className="h-8 w-8" />
            ShopilyBD
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-center">Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <RegisterForm onSuccess={handleSuccess} />
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-purple-600 hover:text-purple-700">
                Already have an account? Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-purple-600 hover:text-purple-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-purple-600 hover:text-purple-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}