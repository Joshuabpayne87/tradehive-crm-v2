'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ExternalLink, Loader2 } from 'lucide-react'

export default function PaymentSettingsPage() {
  const queryClient = useQueryClient()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: company, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings/company')
      if (!res.ok) throw new Error('Failed to fetch settings')
      return res.json()
    },
  })

  const connectStripe = async () => {
    setIsConnecting(true)
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsConnecting(false)
    }
  }

  const openStripeDashboard = async () => {
    try {
      const res = await fetch('/api/stripe/connect')
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const updatePricingModel = async (model: string) => {
    setIsUpdating(true)
    try {
      await fetch('/api/settings/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripePricingModel: model }),
      })
      queryClient.invalidateQueries({ queryKey: ['company-settings'] })
    } catch (error) {
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) return <div>Loading settings...</div>

  return (
    <div className="container mx-auto py-8 max-w-3xl space-y-8">
      <h1 className="text-3xl font-bold">Payment Settings</h1>

      {/* Stripe Connect Status */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Processing</CardTitle>
          <CardDescription>
            Connect your Stripe account to accept payments from customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {company?.stripeAccountId ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Stripe Connected</div>
                  <div className="text-sm text-green-700">Account ID: {company.stripeAccountId}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={openStripeDashboard}>
                View Dashboard <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="p-6 text-center border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-2">Start accepting payments</h3>
              <p className="text-muted-foreground mb-4">
                Create or connect a Stripe account to get paid directly to your bank account.
              </p>
              <Button onClick={connectStripe} disabled={isConnecting}>
                {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect with Stripe
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Model Selection */}
      {company?.stripeAccountId && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Configuration</CardTitle>
            <CardDescription>
              Choose how credit card processing fees are handled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              defaultValue={company.stripePricingModel || 'standard'}
              onValueChange={updatePricingModel}
              className="grid gap-4"
            >
              <div>
                <RadioGroupItem
                  value="standard"
                  id="standard"
                  className="peer sr-only"
                  disabled={isUpdating}
                />
                <Label
                  htmlFor="standard"
                  className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <div className="mb-1 font-semibold">Standard (Merchant Pays)</div>
                  <div className="text-sm text-muted-foreground">
                    You absorb the 2.9% + 30¢ fee. Customers see a clean invoice amount.
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="pass_through"
                  id="pass_through"
                  className="peer sr-only"
                  disabled={isUpdating}
                />
                <Label
                  htmlFor="pass_through"
                  className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <div className="mb-1 font-semibold">Pass-through (Customer Pays)</div>
                  <div className="text-sm text-muted-foreground">
                    A service fee is added to the customer's total. You receive the full invoice amount.
                  </div>
                  <Badge variant="secondary" className="mt-2">Popular for Contractors</Badge>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



