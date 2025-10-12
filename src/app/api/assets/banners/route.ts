import { NextResponse } from "next/server"
import { getBannerAssets } from "@/lib/asset-api"

export async function GET() {
  try {
    const assets = await getBannerAssets()

    return NextResponse.json({
      success: true,
      assets: assets,
    })
  } catch (error) {
    console.error("Error in banners API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}