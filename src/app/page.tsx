"use client";
import { HomeCarousel } from "@/components/home-carousel";
import { TopCategories } from "@/components/TopCategories";
import { TopProducts } from "@/components/TopProducts";

export default function HomePage() {

  return (
    <div className="min-h-screen bg-white mt-3">
      <div className="mx-auto w-full max-w-[1440px]">
        <HomeCarousel />
        <TopCategories />
        <TopProducts />
      </div>
    </div>
  )
}
