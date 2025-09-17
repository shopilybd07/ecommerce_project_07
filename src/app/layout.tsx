import type React from "react"
import type { Metadata } from "next"
import "./globals.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { StoreProvider } from "@/components/StoreProvider";
import { CartProvider } from "@/contexts/cart-context";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Shopilybd",
  description: "Your daily ecommerce solution",
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <StoreProvider>
          <AuthProvider>
            <CartProvider>
              {/* <Header /> */}
              {children}
            </CartProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
