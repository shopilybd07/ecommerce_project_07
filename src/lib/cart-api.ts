import { prisma } from "./prisma"

export interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    sku: string
    images: Array<{
      url: string
      altText?: string | null
      isPrimary?: boolean
    }>
  }
}

export interface Cart {
  id: string
  customerId: string
  items: CartItem[]
  total: number
  itemCount: number
}

export async function getCart(customerId: string): Promise<Cart | null> {
  try {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        cartItems: {
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

    if (!cart) {
      return null
    }

    const items: CartItem[] = cart.cartItems.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        sku: item.product.sku,
        images: item.product.images.map((img: { url: string }) => ({
          url: img.url,
          altText: null,
          isPrimary: false,
        })),
      },
    }))

    const total = items.reduce((sum: number, item: CartItem) => sum + item.product.price * item.quantity, 0)
    const itemCount = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)

    return {
      id: cart.id,
      customerId: cart.customerId,
      items,
      total,
      itemCount,
    }
  } catch (error) {
    console.error("Error fetching cart:", error)
    return null
  }
}

export async function addToCart(customerId: string, productId: string, quantity = 1): Promise<Cart | null> {
  try {
    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { customerId },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
      })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      })
    }

    return await getCart(customerId)
  } catch (error) {
    console.error("Error adding to cart:", error)
    return null
  }
}

export async function updateCartItem(customerId: string, productId: string, quantity: number): Promise<Cart | null> {
  try {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
    })

    if (!cart) {
      return null
    }

    if (quantity <= 0) {
      // Remove item
      await prisma.cartItem.delete({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      })
    } else {
      // Update quantity
      await prisma.cartItem.update({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
        data: { quantity },
      })
    }

    return await getCart(customerId)
  } catch (error) {
    console.error("Error updating cart item:", error)
    return null
  }
}

export async function removeFromCart(customerId: string, productId: string): Promise<Cart | null> {
  try {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
    })

    if (!cart) {
      return null
    }

    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    return await getCart(customerId)
  } catch (error) {
    console.error("Error removing from cart:", error)
    return null
  }
}

export async function clearCart(customerId: string): Promise<boolean> {
  try {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
    })

    if (!cart) {
      return true
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    return true
  } catch (error) {
    console.error("Error clearing cart:", error)
    return false
  }
}

export async function getCartItemCount(customerId: string): Promise<number> {
  try {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        cartItems: true,
      },
    })

    if (!cart) {
      return 0
    }

    return cart.cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
  } catch (error) {
    console.error("Error getting cart item count:", error)
    return 0
  }
}
