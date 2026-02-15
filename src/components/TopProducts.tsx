"use client";

import Link from "next/link";
import { useGetProductsQuery } from "@/store/api";
import { ProductGridCard } from "@/components/shared/ProductGridCard";
import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function TopProducts() {
  const { data, isLoading } = useGetProductsQuery({});
  const products = (data?.products || []).slice(0, 8);
  if (isLoading) {
    return (
      <section className="px-6 lg:px-12 py-16 md:py-24 bg-secondary/50">
        <div className="text-center mb-12">
          <Skeleton className="mx-auto h-8 w-40" />
          <Skeleton className="mx-auto mt-3 h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="px-6 lg:px-12 py-16 md:py-24 bg-secondary/50">
      <div className="text-center mb-12">
        <h2
          className="text-3xl md:text-4xl font-light tracking-wide mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Bestsellers
        </h2>
        <p className="text-muted-foreground text-sm tracking-wide">
          Most loved pieces from our collection
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-12 md:gap-8 max-w-6xl mx-auto">
        {(isLoading ? [] : products).map((product: any) => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>
       <div className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link href="/products">View all products</Link>
          </Button>
        </div>
    </section>
  );
}
