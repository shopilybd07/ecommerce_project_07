export type Product = {
    id: string
    name: string
    slug?: string
    sku: string
    price: number
    description: string
    images: {
        id: string
        url: string
    }[]
    category: {
        id: string
        name: string
    }
    subcategory: {
        id: string
        name: string
    }
    videoUrl?: string
}
