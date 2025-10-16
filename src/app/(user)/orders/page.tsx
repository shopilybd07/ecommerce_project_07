"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOrderById, type Order } from "@/lib/order-api"

export default function OrderDetailsPage() {
    const params = useParams()
    const orderId = params.id as string
    const [order, setOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (orderId) {
            const fetchOrder = async () => {
                try {
                    const response = await fetch(`/api/orders/${orderId}`)
                    const result = await response.json()
                    if (result.success) {
                        setOrder(result.data)
                    } else {
                        setError(result.error)
                    }
                } catch (err) {
                    setError("Failed to fetch order details.")
                } finally {
                    setIsLoading(false)
                }
            }
            fetchOrder()
        }
    }, [orderId])

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p>Loading...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
                        <p>The requested order could not be found.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold">Order #{order.orderNumber}</CardTitle>
                            <p className="text-sm text-gray-500">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold">Total: ৳{order.total.toFixed(2)}</p>
                            <Badge>{order.status}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Order Items */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Items</h3>
                        {order.orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center border-b pb-2">
                                <div className="flex-1">
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-gray-600">
                                        Qty: {item.quantity} @ ৳{item.price.toFixed(2)}
                                    </p>
                                </div>
                                <p className="font-medium">৳{item.total.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Details */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Summary</h3>
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>৳{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax</span>
                            <span>৳{order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>৳{order.shipping.toFixed(2)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-৳{order.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>৳{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping & Billing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {order.shippingAddress && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Shipping Address</h3>
                                <p>{order.shippingAddress.address1}</p>
                                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                                <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                                </p>
                                <p>
                                    {order.shippingAddress.state}, {order.shippingAddress.country}
                                </p>
                            </div>
                        )}
                        {order.billingAddress && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Billing Address</h3>
                                <p>{order.billingAddress.address1}</p>
                                {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                                <p>
                                    {order.billingAddress.city}, {order.billingAddress.zipCode}
                                </p>
                                <p>
                                    {order.billingAddress.state}, {order.billingAddress.country}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Payment</h3>
                        <p>
                            Method: <span className="font-medium">{order.paymentMethod.replace(/_/g, " ")}</span>
                        </p>
                        <p>
                            Status: <Badge>{order.paymentStatus}</Badge>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}