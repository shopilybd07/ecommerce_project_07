import { Card, CardContent } from "@/components/ui/card"

export function ProductCardSkeleton() {
  return (
    <Card className="shadow-md">
      <CardContent className="p-0">
        <div className="aspect-square animate-pulse rounded-t-lg bg-gray-200" />
        <div className="p-4">
          <div className="h-4 w-3/4 animate-pulse bg-gray-200" />
          <div className="mt-2 h-4 w-1/4 animate-pulse bg-gray-200" />
          <div className="mt-4 h-8 w-full animate-pulse rounded-md bg-gray-200" />
        </div>
      </CardContent>
    </Card>
  )
}
