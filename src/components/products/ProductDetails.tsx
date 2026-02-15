"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PhotoProvider, PhotoView } from "react-photo-view"
import "react-photo-view/dist/react-photo-view.css"
import {
    Star,
    Heart,
    ShoppingBag,
    Minus,
    Plus,
    Truck,
    Shield,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Video,
    Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import parse from "html-react-parser"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { SearchBar } from "@/components/search-bar"
import { CategoryNavigation } from "@/components/category-navigation"
import { useGetProductBySlugQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation, useGetWishlistQuery } from "@/store/api"
import { RelatedProducts } from "./RelatedProducts"
import { cn } from "@/lib/utils"
import { ProductDetailsSkeleton } from "./product-details-skeleton"
import { Badge } from "../ui/badge"

const ProductDetails = ({ productSlug }: { productSlug: string }) => {
    const { dispatch } = useCart();
    const {
        state: { user },
    } = useAuth()
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isBuyNowLoading, setIsBuyNowLoading] = useState(false)
    const router = useRouter();

    const { data: product, isLoading } = useGetProductBySlugQuery(productSlug);
    const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !user })
    const [addToWishlist] = useAddToWishlistMutation()
    const [removeFromWishlist] = useRemoveFromWishlistMutation()
    const isInWishlist = !!product && wishlist?.some((item: any) => item.productId === product.id)

    // const categoryName = params.category.charAt(0).toUpperCase() + params.category.slice(1);

    const handleAddToCart = () => {
        if (product) {
            dispatch({
                type: "ADD_ITEM",
                payload: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0].url,
                    category: product.category.name,
                },
            })
        }
    };

    const handleBuyNow = async () => {
        if (!product) return;
        setIsBuyNowLoading(true)
        try {
            const response = await fetch("/api/checkout/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: quantity,
                    userId: user?.id,
                }),
            });

            const result = await response.json();

            if (result.success) {
                router.push(`/checkout?sessionId=${result.data.sessionId}`);
            } else {
                console.error("Failed to create checkout session:", result.error);
            }
        } catch (error) {
            console.error("Error creating checkout session:", error);
        } finally {
            setIsBuyNowLoading(false)
        }
    };

    const toggleWishlist = async () => {
        if (!product) return
        if (!user) {
            router.push("/login")
            return
        }
        if (isInWishlist) {
            await removeFromWishlist(product.id)
        } else {
            await addToWishlist({ productId: product.id })
        }
    }

    if (isLoading) return <ProductDetailsSkeleton />;
    if (!product) return <p className="">Product not found</p>;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1440px] mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                    <Link href="/" className="hover:text-gray-900">
                        Home
                    </Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-gray-900">
                        Products
                    </Link>
                    <span>/</span>
                    <Link href={`/products/${product.category.name.toLowerCase()}`} className="hover:text-gray-900">
                        {product.category.name}
                    </Link>
                    <span>/</span>
                    {product.subcategory && <Link href={`/products/${product.category.name.toLowerCase()}`} className="hover:text-gray-900">
                        {product.subcategory?.name}
                    </Link>}
                    {product.subcategory && <span>/</span>}
                    <span className="text-gray-900 font-medium">{product.name}</span>
                </nav>

                {/* Product Details */}
                <div className="grid lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <PhotoProvider>
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="order-1 lg:order-2 flex-1">
                                <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50 relative">
                                <PhotoView src={product.images[selectedImage].url || "/placeholder.svg"}>
                                    <Image
                                        src={product.images[selectedImage].url || "/placeholder.svg"}
                                        alt={product.name}
                                        width={900}
                                        height={900}
                                        className="w-full h-full object-cover cursor-pointer"
                                    />
                                </PhotoView>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 right-4 bg-white/80 hover:bg-white cursor-pointer"
                                    onClick={toggleWishlist}
                                >
                                    <Heart className={cn("h-5 w-5", isInWishlist && "fill-red-500 text-red-500")} />
                                </Button>
                                {selectedImage > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                                        onClick={() => setSelectedImage(selectedImage - 1)}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                )}
                                {selectedImage < product.images.length - 1 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                                        onClick={() => setSelectedImage(selectedImage + 1)}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                )}
                                </div>
                            </div>
                            <div className="order-2 lg:order-1 flex lg:flex-col gap-3 lg:w-24">
                                {product.images.map((image, index) => (
                                    <PhotoView key={index} src={image.url || "/placeholder.svg"}>
                                        <button
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-square w-16 sm:w-20 lg:w-24 overflow-hidden rounded-lg border-2 transition-colors ${selectedImage === index ? "border-purple-600" : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <Image
                                                src={image.url || "/placeholder.svg"}
                                                alt={`${product.name} ${index + 1}`}
                                                width={150}
                                                height={150}
                                                className="w-full h-full object-cover cursor-pointer"
                                            />
                                        </button>
                                    </PhotoView>
                                ))}
                                {product.videoUrl && (
                                    <button
                                        onClick={() => setIsVideoModalOpen(true)}
                                        className="aspect-square w-16 sm:w-20 lg:w-24 overflow-hidden rounded-lg border-2 transition-colors border-gray-200 hover:border-gray-300 flex items-center justify-center"
                                    >
                                        <Video className="h-8 w-8 text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </PhotoProvider>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            {/* {typeof product.rating === "number" && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="font-medium text-gray-900">{product.rating.toFixed(1)}</span>
                                    {product.reviews ? (
                                        <span className="text-gray-500">({product.reviews} reviews)</span>
                                    ) : null}
                                </div>
                            )} */}
                            <Badge
                                variant="secondary"
                                className="text-xs font-medium text-black/70"
                            >
                                {product.category.name}
                            </Badge>
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">{product.name}</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-lg sm:text-xl font-medium text-gray-900">৳ {product.price}</span>
                            </div>
                            <div className="text-gray-600 leading-relaxed text-sm">{parse(product.description)}</div>
                        </div>

                        {/* Features */}
                        {/* <div>
                            <h3 className="font-semibold mb-3">Key Features</h3>
                            <ul className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div> */}

                        {/* Quantity and Add to Cart */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center rounded-full border border-gray-200 bg-white px-2 py-1">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="h-9 w-9 rounded-full text-gray-600 hover:bg-gray-100"
                                    >
                                        <Minus className="h-4 w-4 mx-auto" />
                                    </button>
                                    <span className="min-w-10 text-center text-sm font-medium text-gray-900">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="h-9 w-9 rounded-full text-gray-600 hover:bg-gray-100"
                                    >
                                        <Plus className="h-4 w-4 mx-auto" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 flex-1">
                                    <Button
                                        size="lg"
                                        className="flex-1 rounded-full bg-black/70 hover:bg-black/50"
                                        onClick={handleAddToCart}
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button
                                    size="lg"
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-black cursor-pointer"
                                    onClick={handleBuyNow}
                                    disabled={isBuyNowLoading}
                                >
                                    {isBuyNowLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                                        </span>
                                    ) : (
                                        "Buy Now"
                                    )}
                                </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-full border border-gray-200 bg-white hover:bg-gray-100"
                                        onClick={toggleWishlist}
                                    >
                                        <Heart className={cn("h-5 w-5", isInWishlist && "fill-red-500 text-red-500")} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {product.videoUrl && (
                            <div className="flex items-center justify-between gap-4 rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center">
                                        <Video className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Product Video</p>
                                        <p className="text-xs text-gray-500">Watch a quick demo</p>
                                    </div>
                                </div>
                                 <Button
                                    variant="ghost"
                                    className="rounded-full bg-white hover:bg-gray-100 border border-gray-200"
                                    onClick={() => setIsVideoModalOpen(true)}
                                >
                                    Watch
                                </Button>
                            </div>
                        )}
                        <Accordion type="single" collapsible className="border-t border-b border-gray-200">
                            <AccordionItem value="details">
                                <AccordionTrigger className="text-base font-medium">Details</AccordionTrigger>
                                <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                                    {parse(product.description)}
                                </AccordionContent>
                            </AccordionItem>
                            {/* <AccordionItem value="benefits">
                                <AccordionTrigger className="text-base font-medium">Benefits</AccordionTrigger>
                                <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                                    Gentle on skin, lightweight wear, and everyday comfort.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="how-to-use">
                                <AccordionTrigger className="text-base font-medium">How To Use</AccordionTrigger>
                                <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                                    Apply evenly to clean skin and reapply as needed.
                                </AccordionContent>
                            </AccordionItem> */}
                        </Accordion>
                    </div>
                </div>

                {/* Related Products */}
                {product.category && (
                    <RelatedProducts
                        categoryId={product.category.id}
                        subcategoryId={product.subcategory?.id}
                        currentProductId={product.id}
                    />
                )}
            </div>
            <VideoModal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                videoUrl={product.videoUrl || ""}
            />
        </div>
    )
};

function getYoutubeEmbedUrl(url: string) {
    let embedUrl = "";
    try {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get("v");
        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (urlObj.hostname === "youtu.be") {
            embedUrl = `https://www.youtube.com/embed${urlObj.pathname}`;
        }
    } catch (error) {
        console.error("Invalid YouTube URL:", error);
    }
    return embedUrl;
}

const VideoModal = ({ isOpen, onClose, videoUrl }: { isOpen: boolean, onClose: () => void, videoUrl: string }) => {
    if (!isOpen) return null;

    const embedUrl = getYoutubeEmbedUrl(videoUrl);

    if (!embedUrl) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
                <div className="bg-white p-8 rounded-lg" onClick={(e) => e.stopPropagation()}>
                    <p>Invalid YouTube URL</p>
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
            <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white text-3xl"
                >
                    &times;
                </button>
                <div className="aspect-video">
                    <iframe
                        width="100%"
                        height="100%"
                        src={embedUrl}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
