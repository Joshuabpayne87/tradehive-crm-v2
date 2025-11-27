'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, CreditCard, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export default function PaymentPageClient({ invoice }: { invoice: any }) {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  
  const success = searchParams.get('success') === 'true'
  const canceled = searchParams.get('canceled') === 'true'
  
  const balanceDue = invoice.total - invoice.amountPaid
  const isPaid = balanceDue <= 0

  const handlePay = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })
      
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to start payment process. Please try again.')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success || isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">Payment Successful</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Thank you for your payment for Invoice #{invoice.invoiceNumber}.
            </p>
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between text-sm mb-2">
                <span>Amount Paid:</span>
                <span className="font-bold">${invoice.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Date:</span>
                <span>{format(new Date(), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Company Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">{invoice.company.name}</h1>
          <p className="text-muted-foreground mt-2">Invoice #{invoice.invoiceNumber}</p>
        </div>

        {canceled && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Payment canceled. No charges were made.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Invoice Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Billed to:</span>
                    <div className="font-medium mt-1">
                      {invoice.customer.firstName} {invoice.customer.lastName}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Due Date:</span>
                    <div className="font-medium mt-1">
                      {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'Due on Receipt'}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="grid grid-cols-12 gap-4 mb-4 text-xs font-medium text-muted-foreground uppercase">
                    <div className="col-span-8">Item</div>
                    <div className="col-span-4 text-right">Amount</div>
                  </div>
                  <div className="space-y-3">
                    {invoice.lineItems.map((item: any) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 text-sm">
                        <div className="col-span-8">
                          <div className="font-medium">{item.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.quantity} x ${item.rate.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-4 text-right">
                          ${item.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col items-end space-y-2">
                  <div className="flex justify-between w-full max-w-[200px] text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-full max-w-[200px] text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${invoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-full max-w-[200px] font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Action */}
          <div className="md:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Pay Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Balance Due</div>
                  <div className="text-3xl font-bold text-primary">${balanceDue.toFixed(2)}</div>
                </div>
                
                {invoice.company.stripePricingModel === 'pass_through' && (
                   <div className="text-xs text-muted-foreground text-center px-2">
                    * A 2.9% + 30¢ processing fee will be added at checkout.
                  </div>
                )}

                {!invoice.company.stripeAccountId && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded">
                    Merchant has not set up online payments yet.
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handlePay} 
                  disabled={isLoading || !invoice.company.stripeAccountId}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                  Pay with Card
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}



