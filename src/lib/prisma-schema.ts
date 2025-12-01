// Prisma Schema Documentation
// This file shows the database schema structure for the hybrid cart system
// In a real application, this would be your schema.prisma file

/*
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "mysql", "sqlite", etc.
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  cart   Cart?
  orders Order[]

  @@map("users")
}

model Cart {
  id        String   @id @default(cuid())
  userId    String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items CartItem[]

  @@map("carts")
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  productId String
  name      String
  price     Float
  image     String?
  category  String
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  cart Cart @relation(fields: [cartId], references: [id], onDelete: Cascade)

  // Ensure unique product per cart
  @@unique([cartId, productId])
  @@map("cart_items")
}

model Order {
  id             String      @id @default(cuid())
  userId         String
  status         OrderStatus @default(PENDING)
  total          Float
  subtotal       Float
  tax            Float
  shipping       Float
  trackingNumber String?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  // Relations
  user            User             @relation(fields: [userId], references: [id])
  items           OrderItem[]
  shippingAddress ShippingAddress?
  billingAddress  BillingAddress?

  @@map("orders")
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  productId String
  name      String
  price     Float
  image     String?
  category  String
  quantity  Int
  createdAt DateTime @default(now())

  // Relations
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("order_items")
}

model ShippingAddress {
  id        String @id @default(cuid())
  orderId   String @unique
  firstName String
  lastName  String
  email     String
  phone     String?
  address   String
  city      String
  state     String
  zipCode   String

  // Relations
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("shipping_addresses")
}

model BillingAddress {
  id        String @id @default(cuid())
  orderId   String @unique
  firstName String
  lastName  String
  address   String
  city      String
  state     String
  zipCode   String

  // Relations
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("billing_addresses")
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
*/

// Export types for TypeScript usage
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Cart {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
  items: CartItem[]
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  name: string
  price: number
  image?: string
  category: string
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  total: number
  subtotal: number
  shipping: number
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}
