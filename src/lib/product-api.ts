"use server"

import prisma from "./prisma"

export async function getAllProducts() {
  return prisma.product.findMany({
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
