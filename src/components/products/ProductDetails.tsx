"use client"

import { Suspense, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import InnerImageZoom from "react-inner-image-zoom"
import 'react-inner-image-zoom/lib/styles.min.css'
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
import parse from "html-react-parser"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { SearchBar } from "@/components/search-bar"
import { CategoryNavigation } from "@/components/category-navigation"
import { useGetProductBySlugQuery } from "@/store/api"
import { RelatedProducts } from "./RelatedProducts"

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

    if (isLoading) return <p className="">Loading...</p>;
    if (!product) return <p className="">Product not found</p>;

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
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
                    <span className="text-gray-900 font-medium">{product.name}</span>
                </nav>

                {/* Product Details */}
                <div className="grid lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50 relative">
                            <InnerImageZoom
                                src={product.images[selectedImage].url || "/placeholder.svg"}
                                zoomSrc={product.images[selectedImage].url || "/placeholder.svg"}
                                fullscreenOnMobile={true}
                            />
                            <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/80 hover:bg-white">
                                <Heart className="h-5 w-5" />
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
                        <div className="grid grid-cols-5 gap-3">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${selectedImage === index ? "border-purple-600" : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <Image
                                        src={image.url || "/placeholder.svg"}
                                        alt={`${product.name} ${index + 1}`}
                                        width={150}
                                        height={150}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                            {product.videoUrl && (
                                <button
                                    onClick={() => setIsVideoModalOpen(true)}
                                    className="aspect-square overflow-hidden rounded-lg border-2 transition-colors border-gray-200 hover:border-gray-300 flex items-center justify-center"
                                >
                                    <Video className="h-8 w-8 text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            {/* <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                            }`}
                                    />
                                ))}
                                <span className="text-sm text-gray-600 ml-2">
                                    {product.rating} ({product.reviews} reviews)
                                </span>
                            </div> */}
                            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl font-bold">${product.price}</span>
                                {/* {product.originalPrice && (
                                    <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
                                )}
                                {product.originalPrice && (
                                    <Badge className="bg-red-100 text-red-800">Save ${product.originalPrice - product.price}</Badge>
                                )} */}
                            </div>
                            <div className="text-gray-600 leading-relaxed">{parse(product.description)}</div>
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
                            <div className="flex items-center gap-4">
                                <span className="font-medium">Quantity:</span>
                                <div className="flex items-center border rounded-lg">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="h-10 w-10"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="px-4 py-2 font-medium">{quantity}</span>
                                    <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-10 w-10">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button size="lg" className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleAddToCart}>
                                    Add to Cart - ৳ {(product.price * quantity).toFixed(2)}
                                </Button>
                                <Button
                                    size="lg"
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-black"
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {product.category && product.subcategory && (
                    <RelatedProducts
                        categoryId={product.category.id}
                        subcategoryId={product.subcategory.id}
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
