"use server"

import prisma from "./prisma"

export async function getProducts(
  filters: { categoryId?: string; subcategoryId?: string } = {},
) {
  const where: any = {}
  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }
  if (filters.subcategoryId) {
    where.subcategoryId = filters.subcategoryId
  }

  return prisma.product.findMany({
    where,
    include: {
      category: true,
      subcategory: true,
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      subcategory: true,
      images: true,
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true,
      images: true,
    },
  })
}

export async function getRelatedProducts(productId: string, categoryId?: string, subcategoryId?: string) {
  const where: any = {
    id: {
      not: productId,
    },
  }

  // Broaden search to category if provided, otherwise fallback to subcategory
  if (categoryId) {
    where.categoryId = categoryId
  } else if (subcategoryId) {
    where.subcategoryId = subcategoryId
  }
  
  return prisma.product.findMany({
    where,
    include: {
      category: true,
      subcategory: true,
      images: true,
    },
    take: 4,
  })
}

export async function getCategories(includeInactive = false) {
  const where = includeInactive ? {} : { status: "ACTIVE" } as const

  return prisma.category.findMany({
    where,
    include: {
      subcategories: {
        where: includeInactive ? {} : { status: "ACTIVE" },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function getSubcategories(
  categoryId?: string,
  includeInactive = false,
) {
  const where: any = {
    ...(categoryId && { categoryId }),
    ...(!includeInactive && { status: "ACTIVE" }),
  }

  return prisma.subcategory.findMany({
    where,
    orderBy: {
      name: "asc",
    },
  })
}
