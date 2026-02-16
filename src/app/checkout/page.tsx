"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { useCart, CartItem } from "@/contexts/cart-context"

interface ShippingAddress {
  address1: string
  address2: string
  city: string
  zipCode: string
  district: string
  country: string
}

interface BillingAddress {
  address1: string
  address2: string
  city: string
  zipCode: string
  district: string
  country: string
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Checkout />
    </Suspense>
  )
}

function Checkout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    state: { user },
  } = useAuth()
  const { state: cartState, dispatch } = useCart()
  const { toast } = useToast()

  const sessionIdParam = searchParams.get("sessionId")
  const [sessionItems, setSessionItems] = useState<CartItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(sessionIdParam);
  const isSessionMode = !!sessionIdParam
  const [isSessionLoading, setIsSessionLoading] = useState(isSessionMode)

  useEffect(() => {
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      const fetchSessionData = async () => {
        try {
          setIsSessionLoading(true)
          const response = await fetch(`/api/checkout/sessions/${sessionIdParam}`);
          const result = await response.json();

          if (result.success) {
            const { product, quantity, price } = result.data;
            setSessionItems([{ 
              id: product.id,
              name: product.name,
              price: price,
              image: product.images?.[0]?.url || "",
              quantity: quantity,
              category: product.category?.name || "",
            }]);
          } else {
            // Handle error
            console.error("Failed to fetch checkout session:", result.error);
          }
        } catch (error) {
          console.error("Error fetching checkout session:", error);
        } finally {
          setIsSessionLoading(false)
        }
      };
      fetchSessionData();
    }
  }, [sessionIdParam]);

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [useBillingAsShipping, setUseBillingAsShipping] = useState(true)

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address1: "",
    address2: "",
    city: "",
    zipCode: "",
    district: "",
    country: "",
  })

  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    address1: "",
    address2: "",
    city: "",
    zipCode: "",
    district: "",
    country: "",
  })

  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [transactionId, setTransactionId] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [promotionCode, setPromotionCode] = useState("")
  const [notes, setNotes] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [createAccount, setCreateAccount] = useState(false)

  // Calculate totals
  const displayItems = isSessionMode ? sessionItems : cartState.items
  const subtotal = displayItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 10 // Free shipping over ৳ 100
  const total = subtotal + shipping

  const handleSubmitOrder = async () => {

    if (displayItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
    const orderData: any = {
      customerId: user?.id,
      items: displayItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      paymentMethod,
      shippingAddress,
      billingAddress: useBillingAsShipping ? shippingAddress : billingAddress,
      notes,
    }

    // Add optional fields
    if (contactName) orderData.contactName = contactName
    if (contactEmail) orderData.contactEmail = contactEmail
    if (contactPhone) orderData.contactPhone = contactPhone
    if (transactionId) orderData.transactionId = transactionId
    if (accountNumber) orderData.accountNumber = accountNumber
    if (createAccount && contactEmail) {
      orderData.createAccount = true;
      orderData.password = "password123"; // Default password or prompt user
    }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Failed to place order")
      }

      const order = await response.json()
      
      // Clear cart
      dispatch({ type: "CLEAR_CART" })
      
      toast({
        title: "Order Placed",
        description: `Your order #${order.id} has been placed successfully.`,
      })

      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Loading State
  if (isSessionMode && isSessionLoading) {
    return <CheckoutSkeleton />
  }

  if (!cartState.isInitialized && !isSessionMode) {
    return <CheckoutSkeleton />
  }

  if (displayItems.length === 0) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 py-8">
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
    <div className="w-full- max-w-[1440px] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 0: Contact Information */}
              {step >= 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  {!user && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact-name">Full Name</Label>
                        <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="contact-email">Email</Label>
                        <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                      </div>
                      <div>
                        <Label htmlFor="contact-phone">Phone</Label>
                        <Input id="contact-phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
                      </div>
                       {!user && (
                        <div className="flex items-center space-x-2 md:col-span-2">
                          <Checkbox id="create-account" checked={createAccount} onCheckedChange={(checked) => setCreateAccount(checked as boolean)} />
                          <Label htmlFor="create-account">Create an account for faster checkout next time</Label>
                        </div>
                      )}
                    </div>
                  )}
                  {user && (
                     <div className="p-4 bg-gray-50 rounded-md">
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-gray-600">{user.email}</p>
                     </div>
                  )}
                </div>
              )}

              {/* Step 1: Shipping Address */}
              {step >= 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address1">Address Line 1</Label>
                      <Input
                        id="address1"
                        value={shippingAddress.address1}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
                        placeholder="Street address"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                      <Input
                        id="address2"
                        value={shippingAddress.address2}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        value={shippingAddress.district}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        defaultValue="Bangladesh"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {step >= 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Method</h3>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod">Cash on Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="bkash" id="bkash" />
                      <Label htmlFor="bkash">bKash</Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="nagad" id="nagad" />
                      <Label htmlFor="nagad">Nagad</Label>
                    </div>
                     <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="rocket" id="rocket" />
                      <Label htmlFor="rocket">Rocket</Label>
                    </div>
                     <div className="flex items-center space-x-2 border p-4 rounded-md">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer">Bank Transfer</Label>
                    </div>
                  </RadioGroup>

                   {/* Payment Details Inputs */}
                  {(paymentMethod === "bkash" || paymentMethod === "nagad" || paymentMethod === "rocket") && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                       <div>
                        <Label htmlFor="transactionId">Transaction ID</Label>
                        <Input
                          id="transactionId"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter transaction ID"
                        />
                      </div>
                       <div>
                        <Label htmlFor="accountNumber">Sender Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Enter sender number"
                        />
                      </div>
                    </div>
                  )}

                   {paymentMethod === "bank_transfer" && (
                     <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">Please transfer the total amount to the following bank account and enter the transaction reference.</p>
                        <div className="font-mono text-sm">
                           Bank: City Bank<br/>
                           Account: 1234567890<br/>
                           Name: Shopilybd
                        </div>
                         <div>
                        <Label htmlFor="transactionId">Transaction Reference / Slip No</Label>
                        <Input
                          id="transactionId"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter reference"
                        />
                      </div>
                     </div>
                  )}

                </div>
              )}

              {/* Step 3: Review */}
              {step >= 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Order Notes</h3>
                   <Textarea
                    placeholder="Notes about your order, e.g. special notes for delivery."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="billing-same"
                      checked={useBillingAsShipping}
                      onCheckedChange={(checked) => setUseBillingAsShipping(checked as boolean)}
                    />
                    <Label htmlFor="billing-same">Billing address same as shipping</Label>
                  </div>
                   {!useBillingAsShipping && (
                    <div className="space-y-4 mt-4">
                        <h3 className="text-lg font-semibold">Billing Address</h3>
                         {/* Repeat address fields for billing - for brevity assuming same structure */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ... billing address inputs ... */}
                             <div className="md:col-span-2">
                                <Label htmlFor="billing-address1">Address Line 1</Label>
                                <Input
                                    id="billing-address1"
                                    value={billingAddress.address1}
                                    onChange={(e) => setBillingAddress({ ...billingAddress, address1: e.target.value })}
                                />
                            </div>
                            {/* Add other fields as needed */}
                         </div>
                    </div>
                  )}
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
                  <Button onClick={() => setStep(step + 1)} className="ml-auto" disabled={isSessionLoading}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmitOrder} disabled={isLoading || !paymentMethod || isSessionLoading} className="ml-auto">
                    {isLoading ? (
                      <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" /><span>Placing Order...</span></span>
                    ) : (
                      "Place Order"
                    )}
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
                {displayItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500">
                        {item.quantity} x ৳ {item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-medium">৳ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">৳ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? "Free" : `৳ ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">৳ {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="h-5 w-48 bg-gray-200 animate-pulse rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-200 animate-pulse rounded" />
                  <div className="h-10 bg-gray-200 animate-pulse rounded" />
                  <div className="h-10 bg-gray-200 animate-pulse rounded" />
                  <div className="h-10 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                      <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                <div className="h-6 w-full bg-gray-200 animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
