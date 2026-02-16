 "use client";
 
 import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import { useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from "@/store/api";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";

export type ProductGridItem = {
   id: string;
   name: string;
   price: number;
   slug: string;
   category: { name: string };
   subcategory?: { name: string } | null;
   images?: { url: string }[];
 };
 
 export function ProductGridCard({ product }: { product: ProductGridItem }) {
  const { state: { user } } = useAuth();
  const router = useRouter();
  const { dispatch } = useCart();
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !user });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const productUrl = product.subcategory ? `/products/${product.category.name.toLowerCase()}/${product.subcategory?.name?.toLowerCase()}/${product.slug}` : `/products/${product.category.name.toLowerCase()}/${product.slug}`;

  const isInWishlist = wishlist?.some((item: any) => item.productId === product.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    // if (!user) {
    //   router.push("/login");
    //   return;
    // }

    if (isInWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist({ productId: product.id });
    }
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || "",
        category: product.category.name,
      },
    });
  };

  return (
    <Link
       key={product.id}
       href={productUrl}
       className="group"
     >
       <div className="relative aspect-[3/4] overflow-hidden bg-card mb-3">
         <img
           src={product.images?.[0]?.url || ""}
           alt={product.name}
           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
           loading="lazy"
         />
         <button
          className={cn(
            "absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm rounded-full transition-opacity hover:text-red-500 cursor-pointer",
            isInWishlist ? "opacity-100 text-red-500" : "opacity-0 group-hover:opacity-100 text-foreground/70"
          )}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          onClick={toggleWishlist}
        >
          <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
        </button>
        <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors cursor-pointer"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm font-medium">Add to Cart</span>
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground tracking-widest uppercase mb-1">
         {product.category.name}
       </p>
       <h3 className="text-sm font-medium tracking-wide mb-1">{product.name}</h3>
      <p className="text-sm text-foreground/70">৳ {product.price}</p>
      <button
        className="mt-3 flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors cursor-pointer lg:hidden"
        onClick={handleAddToCart}
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="text-sm font-medium">Add to Cart</span>
      </button>
     </Link>
   );
 }
