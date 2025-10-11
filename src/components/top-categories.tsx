"use client"

import Link from "next/link"
import Image from "next/image"
import { useGetCategoriesQuery } from "@/store/api"

interface Category {
  id: string
  name: string
  slug: string
  image: string
}

export function TopCategories() {
  const { data: categoriesData, isLoading, isError } = useGetCategoriesQuery();
  const categories = categoriesData?.data || []

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Top Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our curated selection of top categories to find the best products for your needs.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category: Category) => (
            <Link key={category.id} href={`/products/${category.slug}`}>
              <div className="group block">
                <div className="relative h-48 w-full flex justify-center items-end overflow-hidden bg-amber-400 rounded-lg">
                  {/* <Image
                    src={category.image}
                    alt={category.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-110"
                  /> */}
                  <h3 className="mb-3 text-center text-lg font-semibold">{category.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
