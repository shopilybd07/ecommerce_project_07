"use server"

import prisma from "./prisma"

export async function getBannerAssets() {
  try {
    const banners = await prisma.asset.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return banners;
  } catch (error) {
    console.error("Failed to fetch banner assets:", error);
    return [];
  }
}