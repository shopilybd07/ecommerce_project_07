import type React from "react"
import type { Metadata } from "next"
import "./globals.css";
import { Poppins } from "next/font/google"
import { HybridCartProvider } from "@/contexts/hybrid-cart-context"
import { AuthProvider } from "@/contexts/auth-context";
import { StoreProvider } from "@/components/StoreProvider";
import { CartProvider } from "@/contexts/cart-context";

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
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
            {/* <HybridCartProvider> */}
            <CartProvider>{children}
            </CartProvider>
            {/* </HybridCartProvider> */}
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
