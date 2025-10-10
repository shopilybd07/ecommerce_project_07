"use server"

import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

// Database entity interfaces
interface DbUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface DbCart {
  id: string;
}

interface DbCartItem {
  product_id: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
  quantity: number;
}

interface DbOrder {
  id: string;
  date: Date;
  status: string;
  total: number;
  tracking_number: string | null;
}

interface DbOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string | null;
}

export interface UserRole {
  id: string
  userId: string
  roleId: string
  role?: Role
}

export interface Role {
  id: string
  name: string
}

export interface User {
  id: string
  name: string
  username?: string
  phone?: string
  email: string
  avatar?: string
  roles?: UserRole[]
}

export interface Order {
  id: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image: string
  }>
  trackingNumber?: string
}

// Create or get user
export async function createUser(data: {
  name: string
  email: string
  password: string
  phone: string
  username?: string
  address: string
  city: string
  zipCode: string
  country: string
}): Promise<User | null> {
  try {
    await prisma.$queryRaw`BEGIN`

    // Check if user already exists with the same email or phone number
    const existingUser = await prisma.$queryRaw<
      { id: string }[]
    >`SELECT id FROM users WHERE email = ${data.email} OR phone = ${data.phone}`
    if (existingUser.length > 0) {
      console.error("A user with this email or phone number already exists.")
      await prisma.$queryRaw`ROLLBACK`
      return null
    }

    // In a real application, you should hash the password before storing it.
    // For now, we're storing it in plaintext for simplicity.
    const newUser = await prisma.$queryRaw<
      {
        id: string
        name: string
        username: string | null
        phone: string
        email: string
        avatar: string | null
      }[]
    >`
      INSERT INTO users (name, email, password, phone, username)
      VALUES (${data.name}, ${data.email}, ${data.password}, ${data.phone}, ${data.username})
      RETURNING id, name, username, phone, email, avatar
    `

    if (newUser.length === 0) {
      await prisma.$queryRaw`ROLLBACK`
      return null
    }

    const userId = newUser[0].id

    // Create a default billing address for the user
    await prisma.$queryRaw`
      INSERT INTO addresses ("customerId", type, address1, city, "zipCode", country)
      VALUES (${userId}, 'BILLING', ${data.address}, ${data.city}, ${data.zipCode}, ${data.country})
    `

    await prisma.$queryRaw`COMMIT`

    return {
      id: newUser[0].id,
      name: newUser[0].name,
      username: newUser[0].username || undefined,
      phone: newUser[0].phone,
      email: newUser[0].email,
      avatar: newUser[0].avatar || undefined,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    await prisma.$queryRaw`ROLLBACK`
    return null
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.$queryRaw<DbUser[]>`
      SELECT id, name, email, avatar FROM users WHERE email = ${email}
    `

    if (user.length === 0) return null

    return {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      avatar: user[0].avatar || undefined,
    }
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

// Get user orders
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const orders = await prisma.$queryRaw<DbOrder[]>`
      SELECT
        o.id,
        o.created_at as date,
        o.status,
        o.total::float,
        o.tracking_number
      FROM orders o
      WHERE o.user_id = ${userId}
      ORDER BY o.created_at DESC
    `

    const ordersWithItems: Order[] = []

    for (const order of orders) {
      const items = await prisma.$queryRaw<DbOrderItem[]>`
        SELECT
          product_id as id,
          name,
          quantity,
          price::float,
          image
        FROM order_items
        WHERE order_id = ${order.id}
      `

      ordersWithItems.push({
        id: order.id,
        date: order.date.toISOString().split("T")[0],
        status: order.status.toLowerCase() as Order["status"],
        total: order.total,
        trackingNumber: order.tracking_number || undefined,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || "",
        })),
      })
    }

    return ordersWithItems
  } catch (error) {
    console.error("Error getting user orders:", error)
    return []
  }
}

// Create order from cart
export async function createOrderFromCart(
  userId: string,
  orderData: {
    subtotal: number
    tax: number
    shipping: number
    total: number
    shippingAddress: {
      firstName: string
      lastName: string
      email: string
      phone?: string
      address: string
      city: string
      state: string
      zipCode: string
    }
    billingAddress?: {
      firstName: string
      lastName: string
      address: string
      city: string
      state: string
      zipCode: string
    }
  },
): Promise<string | null> {
  try {
    await prisma.$queryRaw`BEGIN`

    // Get user's cart
    const cart = await prisma.$queryRaw<DbCart[]>`
      SELECT id FROM carts WHERE user_id = ${userId}
    `

    if (cart.length === 0) {
      await prisma.$queryRaw`ROLLBACK`
      return null
    }

    const cartId = cart[0].id

    // Get cart items
    const cartItems = await prisma.$queryRaw<DbCartItem[]>`
      SELECT product_id, name, price, image, category, quantity
      FROM cart_items
      WHERE cart_id = ${cartId}
    `

    if (cartItems.length === 0) {
      await prisma.$queryRaw`ROLLBACK`
      return null
    }

    // Create order
    const order = await prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO orders (user_id, status, subtotal, tax, shipping, total)
      VALUES (${userId}, 'PENDING', ${orderData.subtotal}, ${orderData.tax}, ${orderData.shipping}, ${orderData.total})
      RETURNING id
    `

    const orderId = order[0].id

    // Create order items
    for (const item of cartItems) {
      await prisma.$queryRaw`
        INSERT INTO order_items (order_id, product_id, name, price, image, category, quantity)
        VALUES (${orderId}, ${item.product_id}, ${item.name}, ${item.price}, ${item.image}, ${item.category}, ${item.quantity})
      `
    }

    // Create shipping address
    await prisma.$queryRaw`
      INSERT INTO shipping_addresses (order_id, first_name, last_name, email, phone, address, city, state, zip_code)
      VALUES (${orderId}, ${orderData.shippingAddress.firstName}, ${orderData.shippingAddress.lastName},
              ${orderData.shippingAddress.email}, ${orderData.shippingAddress.phone}, ${orderData.shippingAddress.address},
              ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}, ${orderData.shippingAddress.zipCode})
    `

    // Create billing address if provided
    if (orderData.billingAddress) {
      await prisma.$queryRaw`
        INSERT INTO billing_addresses (order_id, first_name, last_name, address, city, state, zip_code)
        VALUES (${orderId}, ${orderData.billingAddress.firstName}, ${orderData.billingAddress.lastName},
                ${orderData.billingAddress.address}, ${orderData.billingAddress.city},
                ${orderData.billingAddress.state}, ${orderData.billingAddress.zipCode})
      `
    }

    // Clear cart
    await prisma.$queryRaw`
      DELETE FROM cart_items WHERE cart_id = ${cartId}
    `

    await prisma.$queryRaw`COMMIT`
    return orderId
  } catch (error) {
    await prisma.$queryRaw`ROLLBACK`
    console.error("Error creating order:", error)
    return null
  }
}

// Set auth cookie
export async function setAuthCookie(user: User) {
  const cookieStore = await cookies()
  cookieStore.set("auth-user", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

// Get auth cookie
export async function getAuthCookie(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("auth-user")

    if (!userCookie) return null

    return JSON.parse(userCookie.value)
  } catch (error) {
    console.error("Error getting auth cookie:", error)
    return null
  }
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-user")
}
