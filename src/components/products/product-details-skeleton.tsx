import { Skeleton } from "@/components/ui/skeleton"

export function ProductDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2 mb-8">
          <Skeleton className="h-4 w-12" />
          <span className="text-gray-300">/</span>
          <Skeleton className="h-4 w-16" />
          <span className="text-gray-300">/</span>
          <Skeleton className="h-4 w-20" />
          <span className="text-gray-300">/</span>
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" /> {/* Title */}
            <Skeleton className="h-8 w-1/4" /> {/* Price */}
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>

            {/* Quantity and Buttons */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <div className="flex items-center border rounded-lg">
                   <Skeleton className="h-10 w-32" />
                </div>
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products Skeleton Placeholder */}
        <div className="space-y-6">
           <Skeleton className="h-8 w-48 mb-4" />
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="space-y-3">
                 <Skeleton className="aspect-square rounded-xl" />
                 <Skeleton className="h-4 w-2/3" />
                 <Skeleton className="h-4 w-1/3" />
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  )
}
