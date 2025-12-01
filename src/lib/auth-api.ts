"use server"

import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import * as bcrypt from "bcryptjs"

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

export interface User {
  id: string
  firstName: string;
  lastName: string;
  username?: string
  phone?: string
  email: string
  avatar?: string
  role: string;
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
  firstName: string;
  lastName: string;
  email: string
  password: string
  phone: string
  username?: string
  address: string
  city: string
  zipCode: string
  country: string
  district: string
}): Promise<User | null> {
  try {
    // Check if user already exists with the same email or phone number
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    })

    if (existingUser) {
      console.error("A user with this email or phone number already exists.")
      return null
    }

    // In a real application, you should hash the password before storing it.
    const hashedPassword = await bcrypt.hash(data.password, 10)
    const newUser = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        username: data.username,
        role: "CUSTOMER",
        addresses: {
          create: {
            type: "BILLING",
            address1: data.address,
            city: data.city,
            zipCode: data.zipCode,
            country: data.country,
            district: data.district,
          },
        },
      },
    })

    return {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username || undefined,
      phone: newUser.phone,
      email: newUser.email,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
      },
    })

    if (!user) return null

    return user
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
      INSERT INTO orders (user_id, status, subtotal, shipping, total)
      VALUES (${userId}, 'PENDING', ${orderData.subtotal}, ${orderData.shipping}, ${orderData.total})
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

// Login user
export async function loginUser(data: {
  email: string
  password: string
}): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      console.error("User not found.")
      return null
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      console.error("Invalid password.")
      return null
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username || undefined,
      phone: user.phone,
      email: user.email,
      role: user.role,
    }
  } catch (error) {
    console.error("Error logging in user:", error)
    return null
  }
}
