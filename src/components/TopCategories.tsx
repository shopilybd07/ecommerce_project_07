"use client";

import Link from "next/link";
import { useGetCategoriesQuery } from "@/store/api";
import { Skeleton } from "@/components/ui/skeleton";

export function TopCategories() {
  const { data, isLoading } = useGetCategoriesQuery();
  const categories = data?.data || [];
  if (isLoading) {
    return (
      <section className="px-6 lg:px-12 py-16 md:py-24">
        <div className="text-center mb-12">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto mt-3 h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] w-full rounded-md" />
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="px-6 lg:px-12 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2
          className="text-3xl md:text-4xl font-light tracking-wide mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Shop by Category
        </h2>
        <p className="text-muted-foreground text-sm tracking-wide">
          Explore our curated collections
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
        {(isLoading ? [] : categories).map((cat: any) => (
          <Link
            key={cat.id}
            href={`/products/${cat.name.toLowerCase()}`}
            className="group relative aspect-[3/4] overflow-hidden rounded-md bg-center bg-cover"
            style={
              cat?.imageUrl
                ? { backgroundImage: `url(${cat.imageUrl})` }
                : undefined
            }
          >
            {!cat?.imageUrl && (
              <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/50" />
            )}
            <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3
                className="text-white text-xl md:text-2xl font-light tracking-wide"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {cat.name}
              </h3>
              <span className="text-white/70 text-xs tracking-widest uppercase mt-1 inline-block transition-colors">
                {cat._count?.products || 0} {cat._count?.products === 1 ? "product" : "products"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
