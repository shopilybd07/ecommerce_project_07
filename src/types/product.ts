export type Product = {
    id: string
    name: string
    sku: string
    price: number
    description: string
    images: {
        id: string
        url: string
    }[]
    category: {
        name: string
    }
}