'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PortalEstimateDetail({ estimate }: { estimate: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleResponse = async (action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this estimate?`)) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/portal/estimates/${estimate.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      
      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to update estimate. Please try again.')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/portal/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="bg-muted/10 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{estimate.title}</CardTitle>
              <div className="text-muted-foreground mt-1">
                Estimate #{estimate.estimateNumber}
              </div>
            </div>
            <Badge variant={
              estimate.status === 'approved' ? 'default' : 
              estimate.status === 'rejected' ? 'destructive' : 'outline'
            } className="text-base px-4 py-1 capitalize">
              {estimate.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Company & Customer Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">From</h3>
              <div className="font-medium">{estimate.company.name}</div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {estimate.company.address}<br />
                {estimate.company.city}, {estimate.company.state} {estimate.company.zip}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">To</h3>
              <div className="font-medium">{estimate.customer.firstName} {estimate.customer.lastName}</div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="grid grid-cols-12 gap-4 mb-4 text-xs font-medium text-muted-foreground uppercase px-2">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            <div className="space-y-2">
              {estimate.lineItems.map((item: any) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 py-3 border-b px-2 last:border-0 text-sm">
                  <div className="col-span-6 font-medium">{item.description}</div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right">${item.rate.toFixed(2)}</div>
                  <div className="col-span-2 text-right">${item.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${estimate.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${estimate.tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${estimate.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {estimate.notes && (
            <div className="bg-muted/30 p-4 rounded-lg text-sm">
              <h4 className="font-medium mb-1">Notes & Terms</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{estimate.notes}</p>
            </div>
          )}
        </CardContent>

        {/* Action Buttons */}
        {estimate.status === 'sent' || estimate.status === 'viewed' || estimate.status === 'draft' ? (
          <CardFooter className="bg-muted/10 p-6 flex flex-col sm:flex-row justify-end gap-4 border-t">
            <Button 
              variant="destructive" 
              onClick={() => handleResponse('reject')}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Reject Estimate
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={() => handleResponse('approve')}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Approve Estimate
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  )
}



