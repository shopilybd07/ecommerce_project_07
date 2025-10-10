"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/cart-context"

interface ShippingAddress {
  address1: string
  address2: string
  city: string
  zipCode: string
}

interface BillingAddress {
  address1: string
  address2: string
  city: string
  zipCode: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { state, dispatch } = useCart();
  const items = state.items;
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [useBillingAsShipping, setUseBillingAsShipping] = useState(true)

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address1: "",
    address2: "",
    city: "",
    zipCode: "",
  })

  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    address1: "",
    address2: "",
    city: "",
    zipCode: "",
  })

  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [transactionId, setTransactionId] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [promotionCode, setPromotionCode] = useState("")
  const [notes, setNotes] = useState("")

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08 // 8% tax rate
  const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
  const total = subtotal + tax + shipping

  const handleSubmitOrder = async () => {
    // if (!user) {
    //   toast({
    //     title: "Authentication Required",
    //     description: "Please log in to place an order.",
    //     variant: "destructive",
    //   })
    //   return
    // }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const orderData = {
        userId: "regerhg",
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        billingAddress: useBillingAsShipping ? undefined : billingAddress,
        paymentMethod: paymentMethod as any,
        transactionId: transactionId || undefined,
        accountNumber: accountNumber || undefined,
        promotionCode: promotionCode || undefined,
        notes: notes || undefined,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        dispatch({ type: "CLEAR_CART" })
        toast({
          title: "Order Placed Successfully!",
          description: `Your order ${result.data.orderNumber} has been placed.`,
        })
        router.push(`/orders/${result.data.id}`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // if (!user) {
  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <Card>
  //         <CardContent className="p-8 text-center">
  //           <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
  //           <p className="text-gray-600 mb-6">Please log in to continue with checkout.</p>
  //           <Button onClick={() => router.push("/login")}>Go to Login</Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to your cart before checkout.</p>
            <Button onClick={() => router.push("/")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Shipping Address */}
              {step >= 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipping-address1">Address Line 1</Label>
                      <Input
                        id="shipping-address1"
                        value={shippingAddress.address1}
                        onChange={(e) => setShippingAddress((prev) => ({ ...prev, address1: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-address2">Address Line 2 (Optional)</Label>
                      <Input
                        id="shipping-address2"
                        value={shippingAddress.address2}
                        onChange={(e) => setShippingAddress((prev) => ({ ...prev, address2: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-city">City</Label>
                      <Input
                        id="shipping-city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress((prev) => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="shipping-zipCode">ZIP Code</Label>
                      <Input
                        id="shipping-zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress((prev) => ({ ...prev, zipCode: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Billing Address */}
              {step >= 2 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-shipping-as-billing"
                      checked={useBillingAsShipping}
                      onCheckedChange={(checked) => setUseBillingAsShipping(checked as boolean)}
                    />
                    <Label htmlFor="use-shipping-as-billing">Use shipping address as billing address</Label>
                  </div>

                  {!useBillingAsShipping && (
                    <>
                      <h3 className="text-lg font-semibold">Billing Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="billing-address1">Address Line 1</Label>
                          <Input
                            id="billing-address1"
                            value={billingAddress.address1}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, address1: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="billing-address2">Address Line 2 (Optional)</Label>
                          <Input
                            id="billing-address2"
                            value={billingAddress.address2}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, address2: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billing-city">City</Label>
                          <Input
                            id="billing-city"
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, city: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="billing-zipCode">ZIP Code</Label>
                          <Input
                            id="billing-zipCode"
                            value={billingAddress.zipCode}
                            onChange={(e) => setBillingAddress((prev) => ({ ...prev, zipCode: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Payment Method */}
              {step >= 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Method</h3>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CASH_ON_DELIVERY" id="cod" />
                      <Label htmlFor="cod">Cash On Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="BKASH" id="bkash" />
                      <Label htmlFor="bkash">Bkash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="NAGAD" id="nagad" />
                      <Label htmlFor="nagad">Nagad</Label>
                    </div>
                  </RadioGroup>

                  {(paymentMethod === "BKASH" || paymentMethod === "NAGAD") && (
                    <div className="space-y-4 rounded-md border bg-gray-50 p-4">
                      <p className="text-sm text-gray-600">
                        Please complete your {paymentMethod} payment and provide the transaction details below.
                      </p>
                      <div>
                        <Label htmlFor="transactionId">Transaction ID</Label>
                        <Input
                          id="transactionId"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="promotion-code">Promotion Code (Optional)</Label>
                    <Input
                      id="promotion-code"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value)}
                      placeholder="Enter promotion code"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions for your order"
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Previous
                  </Button>
                )}
                {step < 3 ? (
                  <Button onClick={() => setStep(step + 1)} className="ml-auto">
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmitOrder} disabled={isLoading || !paymentMethod} className="ml-auto">
                    {isLoading ? "Placing Order..." : "Place Order"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {subtotal > 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-medium">🎉 You qualify for free shipping!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
