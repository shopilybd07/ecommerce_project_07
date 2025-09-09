import { prisma } from "./prisma"
import type { ProductStatus, ProductType, Prisma } from "@prisma/client"

// Types
export interface ProductFilters {
  categoryId?: string
  subcategoryId?: string
  status?: ProductStatus
  type?: ProductType
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
  tags?: string[]
}

export interface PaginationOptions {
  page: number
  limit: number
  sortBy: string
  sortOrder: "asc" | "desc"
}

export interface ProductsResult {
  products: any[]
  total: number
  page: number
  totalPages: number
}

// Product API functions
export async function getProducts(
  filters: ProductFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" },
): Promise<ProductsResult> {
  const { page, limit, sortBy, sortOrder } = pagination
  const skip = (page - 1) * limit

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    status: filters.status || "ACTIVE",
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters.subcategoryId) {
    where.subcategoryId = filters.subcategoryId
  }

  if (filters.type) {
    where.type = filters.type
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {}
    if (filters.minPrice) where.price.gte = filters.minPrice
    if (filters.maxPrice) where.price.lte = filters.maxPrice
  }

  if (filters.inStock) {
    where.stockQuantity = { gt: 0 }
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  if (filters.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags }
  }

  // Build orderBy
  const orderBy: Prisma.ProductOrderByWithRelationInput = {}
  if (sortBy === "price") {
    orderBy.price = sortOrder
  } else if (sortBy === "name") {
    orderBy.name = sortOrder
  } else if (sortBy === "stockQuantity") {
    orderBy.stockQuantity = sortOrder
  } else {
    orderBy.createdAt = sortOrder
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        subcategory: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        videos: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
      videos: true,
      inventoryMovements: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      stockAlerts: {
        where: { isActive: true },
      },
    },
  })
}

export async function getProductBySku(sku: string) {
  return prisma.product.findUnique({
    where: { sku },
    include: {
      category: true,
      subcategory: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
      videos: true,
    },
  })
}

export async function searchProducts(
  query: string,
  filters: ProductFilters = {},
  pagination: PaginationOptions = { page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" },
): Promise<ProductsResult> {
  const searchFilters = {
    ...filters,
    search: query,
  }

  return getProducts(searchFilters, pagination)
}

export async function updateProductStock(
  productId: string,
  quantity: number,
  type: "IN" | "OUT" | "ADJUSTMENT",
  reason?: string,
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new Error("Product not found")
    }

    let newQuantity = product.stockQuantity
    if (type === "IN") {
      newQuantity += quantity
    } else if (type === "OUT") {
      newQuantity -= quantity
    } else {
      newQuantity = quantity
    }

    // Update product stock
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: Math.max(0, newQuantity) },
    })

    // Create inventory movement record
    await tx.inventoryMovement.create({
      data: {
        productId,
        type,
        quantity,
        reason,
      },
    })

    // Check for stock alerts
    if (updatedProduct.stockQuantity <= updatedProduct.minStockLevel) {
      await tx.stockAlert.upsert({
        where: {
          productId_alertType: {
            productId,
            alertType: "LOW_STOCK",
          },
        },
        update: {
          isActive: true,
        },
        create: {
          productId,
          alertType: "LOW_STOCK",
          threshold: updatedProduct.minStockLevel,
          isActive: true,
        },
      })
    }

    return updatedProduct
  })
}

// Category API functions
export async function getCategories(includeInactive = false) {
  const where: Prisma.CategoryWhereInput = includeInactive ? {} : { status: "ACTIVE" }

  return prisma.category.findMany({
    where,
    include: {
      subcategories: {
        where: includeInactive ? {} : { status: "ACTIVE" },
        orderBy: { name: "asc" },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      subcategories: {
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
      },
      products: {
        where: { status: "ACTIVE" },
        include: {
          images: {
            where: { isPrimary: true },
          },
        },
        orderBy: { name: "asc" },
        take: 20,
      },
      _count: {
        select: { products: true },
      },
    },
  })
}

// Subcategory API functions
export async function getSubcategories(categoryId?: string, includeInactive = false) {
  const where: Prisma.SubcategoryWhereInput = {
    ...(includeInactive ? {} : { status: "ACTIVE" }),
    ...(categoryId ? { categoryId } : {}),
  }

  return prisma.subcategory.findMany({
    where,
    include: {
      category: true,
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function getSubcategoryById(id: string) {
  return prisma.subcategory.findUnique({
    where: { id },
    include: {
      category: true,
      products: {
        where: { status: "ACTIVE" },
        include: {
          images: {
            where: { isPrimary: true },
          },
        },
        orderBy: { name: "asc" },
        take: 20,
      },
      _count: {
        select: { products: true },
      },
    },
  })
}
