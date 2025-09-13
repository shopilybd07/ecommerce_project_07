"use client"

import Link from "next/link"
import { useGetCategoriesQuery } from "@/store/api"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function CategoriesPage() {
  const { data: categoriesData, isLoading, isError } = useGetCategoriesQuery()
  const categories = categoriesData?.data || []

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading categories.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Categories</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category: any) => (
          <Link key={category.id} href={`/products/${category.name.toLowerCase()}`}>
            <Card className="group cursor-pointer border-gray-200 hover:border-purple-600 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors">
                  {category.name}
                </h3>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
