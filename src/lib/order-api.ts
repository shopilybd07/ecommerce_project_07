import prisma from "./prisma"
import { Prisma } from "@prisma/client"

// Define enums since they're not properly exported from @prisma/client
export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

export enum FulfillmentStatus {
  UNFULFILLED = "UNFULFILLED",
  FULFILLED = "FULFILLED",
  PARTIALLY_FULFILLED = "PARTIALLY_FULFILLED",
  CANCELLED = "CANCELLED"
}

export enum AddressType {
  SHIPPING = "SHIPPING",
  BILLING = "BILLING"
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
  BKASH = "BKASH",
  NAGAD = "NAGAD"
}

export interface CreateOrderData {
  customerId: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    address1: string
    address2?: string
    city: string
    zipCode: string
    state?: string
    country: string
  }
  billingAddress?: {
    address1: string
    address2?: string
    city: string
    zipCode: string
    state?: string
    country: string
  }
  paymentMethod: PaymentMethod
  transactionId?: string
  accountNumber?: string
  promotionCode?: string
  notes?: string
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  fulfillmentStatus: FulfillmentStatus
  paymentMethod: PaymentMethod
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  notes: string | null
  createdAt: Date
  updatedAt: Date
  customer: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
  shippingAddress: {
    address1: string
    address2: string | null
    city: string
    zipCode: string
    state: string | null
    country: string
  } | null
  billingAddress: {
    address1: string
    address2: string | null
    city: string
    zipCode: string
    state: string | null
    country: string
  } | null
  promotion: {
    id: string
    code: string
    name: string
    discountType: string
    discountValue: number
  } | null
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    total: number
    product: {
      id: string
      name: string
      sku: string
      images: Array<{
        url: string
        altText?: string | null
      }>
    }
  }>
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${timestamp.slice(-6)}-${random}`
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  try {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Validate customer
      const user = await tx.user.findUnique({
        where: { id: data.customerId },
      })

      if (!user) {
        throw new Error("Customer not found")
      }

      // Validate products and calculate totals
      let subtotal = 0
      const validatedItems = []

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { inventory: true },
        })

        if (!product || !product.inventory) {
          throw new Error(`Product ${item.productId} not found`)
        }

        if (product.inventory.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`)
        }

        const itemTotal = product.price * item.quantity
        subtotal += itemTotal

        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal,
        })
      }

      // Apply promotion if provided
      let discount = 0
      let promotionId = null

      if (data.promotionCode) {
        const promotion = await tx.promotion.findUnique({
          where: { code: data.promotionCode },
        })

        if (promotion && promotion.isActive) {
          const now = new Date()
          const isValid =
            (!promotion.startsAt || promotion.startsAt <= now) &&
            (!promotion.expiresAt || promotion.expiresAt >= now) &&
            (!promotion.usageLimit || promotion.usedCount < promotion.usageLimit) &&
            subtotal >= promotion.minOrderAmount

          if (isValid) {
            if (promotion.discountType === "PERCENTAGE") {
              discount = subtotal * (promotion.discountValue / 100)
            } else {
              discount = promotion.discountValue
            }

            if (promotion.maxDiscountAmount) {
              discount = Math.min(discount, promotion.maxDiscountAmount)
            }

            promotionId = promotion.id

            // Update promotion usage
            await tx.promotion.update({
              where: { id: promotion.id },
              data: { usedCount: promotion.usedCount + 1 },
            })
          }
        }
      }

      // Calculate tax and shipping (simplified)
      const tax = subtotal * 0.08 // 8% tax
      const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
      const total = subtotal + tax + shipping - discount

      // Create or get shipping address
      const shippingAddress = await tx.address.create({
        data: {
          ...data.shippingAddress,
          type: AddressType.SHIPPING,
          customerId: data.customerId,
        },
      })

      // Create or get billing address
      let billingAddress = null
      if (data.billingAddress) {
        billingAddress = await tx.address.create({
          data: {
            ...data.billingAddress,
            type: AddressType.BILLING,
            customerId: data.customerId,
          },
        })
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: data.customerId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          accountNumber: data.accountNumber,
          subtotal,
          tax,
          shipping,
          discount,
          total,
          notes: data.notes,
          shippingAddressId: shippingAddress.id,
          billingAddressId: billingAddress?.id,
          promotionId,
        },
      })

      // Create order items
      await tx.orderItem.createMany({
        data: validatedItems.map((item) => ({
          ...item,
          orderId: order.id,
        })),
      })

      // Update product stock
      for (const item of validatedItems) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        })

        // Create inventory movement
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: -item.quantity,
            reason: "Order fulfillment",
            referenceId: order.id,
          },
        })
      }

      // Clear customer's cart
      const cart = await tx.cart.findUnique({
        where: { customerId: data.customerId },
      })

      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        })
      }

      const newOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: {
          customer: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          shippingAddress: true,
          billingAddress: true,
          promotion: true,
          orderItems: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                  },
                },
              },
            },
          },
        },
      })
      if (!newOrder) {
        throw new Error("Could not fetch newly created order")
      }
      return newOrder
    })
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        shippingAddress: true,
        billingAddress: true,
        promotion: true,
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return null
    }

    return {
      ...order,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      promotion: order.promotion
        ? {
          ...order.promotion,
          discountValue: order.promotion.discountValue,
        }
        : null,
      orderItems: order.orderItems.map((item: any) => ({
        ...item,
        price: item.price,
        total: item.total,
        product: {
          ...item.product,
          images: item.product.images.map((img: { url: string }) => ({
            url: img.url,
            altText: null,
          })),
        },
      })),
    }
  } catch (error) {
    console.error("Error fetching order:", error)
    return null
  }
}

export async function getOrdersByCustomerId(customerId: string): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        customer: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        shippingAddress: true,
        billingAddress: true,
        promotion: true,
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return orders.map((order: any) => ({
      ...order,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      promotion: order.promotion
        ? {
          ...order.promotion,
          discountValue: order.promotion.discountValue,
        }
        : null,
      orderItems: order.orderItems.map((item: any) => ({
        ...item,
        price: item.price,
        total: item.total,
        product: {
          ...item.product,
          images: item.product.images.map((img: { url: string }) => ({
            url: img.url,
            altText: null,
          })),
        },
      })),
    }))
  } catch (error) {
    console.error("Error fetching customer orders:", error)
    return []
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
  fulfillmentStatus?: FulfillmentStatus,
): Promise<Order | null> {
  try {
    const updateData: {
      status: OrderStatus
      paymentStatus?: PaymentStatus
      fulfillmentStatus?: FulfillmentStatus
    } = { status }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
    }

    if (fulfillmentStatus) {
      updateData.fulfillmentStatus = fulfillmentStatus
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    })

    return await getOrderById(orderId)
  } catch (error) {
    console.error("Error updating order status:", error)
    return null
  }
}

export async function validatePromotion(code: string, subtotal: number) {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { code },
    })

    if (!promotion || !promotion.isActive) {
      return { valid: false, error: "Invalid promotion code" }
    }

    const now = new Date()

    if (promotion.startsAt && promotion.startsAt > now) {
      return { valid: false, error: "Promotion has not started yet" }
    }

    if (promotion.expiresAt && promotion.expiresAt < now) {
      return { valid: false, error: "Promotion has expired" }
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return { valid: false, error: "Promotion usage limit reached" }
    }

    if (subtotal < promotion.minOrderAmount) {
      return {
        valid: false,
        error: `Minimum order amount of $${promotion.minOrderAmount} required`,
      }
    }

    let discount = 0
    if (promotion.discountType === "PERCENTAGE") {
      discount = subtotal * (promotion.discountValue / 100)
    } else {
      discount = promotion.discountValue
    }

    if (promotion.maxDiscountAmount) {
      discount = Math.min(discount, promotion.maxDiscountAmount)
    }

    return {
      valid: true,
      promotion: {
        ...promotion,
        discountValue: promotion.discountValue,
        minOrderAmount: promotion.minOrderAmount,
        maxDiscountAmount: promotion.maxDiscountAmount ? promotion.maxDiscountAmount : null,
      },
      discount,
    }
  } catch (error) {
    console.error("Error validating promotion:", error)
    return { valid: false, error: "Error validating promotion" }
  }
}
