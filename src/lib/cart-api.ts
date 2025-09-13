import prisma from "./prisma"

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

export interface CartData {
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

// Function to sync the entire cart to the backend
export async function syncCartToBackend(userId: string, cartData: CartData): Promise<boolean> {
  try {
    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { customerId: userId },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId: userId },
      })
    }

    // Delete all existing items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    // Add all items from cartData
    for (const item of cartData.items) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.product.id,
          quantity: item.quantity,
        },
      })
    }

    return true
  } catch (error) {
    console.error("Error syncing cart to backend:", error)
    return false
  }
}

// Function to add a single item to the backend cart
export async function addItemToBackendCart(userId: string, item: Partial<CartItem> & { id: string }): Promise<boolean> {
  try {
    // In the context, this is called with { ...action.payload, quantity: 1 }
    // where action.payload is Omit<CartItem, "quantity">
    const result = await addToCart(userId, item.id, item.quantity || 1)
    return !!result
  } catch (error) {
    console.error("Error adding item to backend cart:", error)
    return false
  }
}

// Function to update an item's quantity in the backend cart
export async function updateItemInBackendCart(userId: string, itemId: string, quantity: number): Promise<boolean> {
  try {
    // In the context, itemId is the item.id, not the product.id
    const result = await updateCartItem(userId, itemId, quantity)
    return !!result
  } catch (error) {
    console.error("Error updating item in backend cart:", error)
    return false
  }
}

// Function to remove an item from the backend cart
export async function removeItemFromBackendCart(userId: string, itemId: string): Promise<boolean> {
  try {
    // In the context, itemId is the item.id, not the product.id
    const result = await removeFromCart(userId, itemId)
    return !!result
  } catch (error) {
    console.error("Error removing item from backend cart:", error)
    return false
  }
}

// Function to clear the entire backend cart
export async function clearBackendCart(userId: string): Promise<boolean> {
  try {
    return await clearCart(userId)
  } catch (error) {
    console.error("Error clearing backend cart:", error)
    return false
  }
}

// Function to merge a local cart with a backend cart when a user logs in
export async function mergeCartsOnLogin(userId: string, localCartData: CartData): Promise<CartData> {
  try {
    // Get backend cart
    const backendCart = await getCart(userId)

    if (!backendCart) {
      // If no backend cart exists, just sync the local cart
      await syncCartToBackend(userId, localCartData)
      return localCartData
    }

    // Convert backend cart to CartData format
    const backendCartData: CartData = {
      items: backendCart.items,
      total: backendCart.total,
      itemCount: backendCart.itemCount,
    }

    // Create a map of product IDs to items for easier merging
    const mergedItemsMap = new Map<string, CartItem>()

    // Add backend items to the map
    for (const item of backendCartData.items) {
      mergedItemsMap.set(item.product.id, { ...item })
    }

    // Merge local items, adding quantities for existing items
    for (const localItem of localCartData.items) {
      const existingItem = mergedItemsMap.get(localItem.product.id)

      if (existingItem) {
        // Update quantity if item exists
        existingItem.quantity += localItem.quantity
      } else {
        // Add new item if it doesn't exist
        mergedItemsMap.set(localItem.product.id, { ...localItem })
      }
    }

    // Convert map back to array
    const mergedItems = Array.from(mergedItemsMap.values())

    // Calculate new totals
    const total = mergedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const itemCount = mergedItems.reduce((sum, item) => sum + item.quantity, 0)

    // Create merged cart data
    const mergedCartData: CartData = {
      items: mergedItems,
      total,
      itemCount,
    }

    // Sync merged cart to backend
    await syncCartToBackend(userId, mergedCartData)

    return mergedCartData
  } catch (error) {
    console.error("Error merging carts on login:", error)
    // Return local cart data as fallback
    return localCartData
  }
}
