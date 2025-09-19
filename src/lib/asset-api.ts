import prisma from "@/lib/prisma";

export async function getBannerAssets() {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        usage: "BANNER",
      },
    });
    return assets;
  } catch (error) {
    console.error("Error fetching banner assets:", error);
    return [];
  }
}
