'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CustomerDialog } from '@/components/customers/customer-dialog'
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  ArrowLeft,
  Pencil,
} from 'lucide-react'
import { format } from 'date-fns'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${id}`)
      if (!res.ok) throw new Error('Failed to fetch customer')
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading customer details...</div>
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Customer not found</h1>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-6 md:space-y-8 px-2 md:px-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent -ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {customer.firstName} {customer.lastName}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">Customer since {format(new Date(customer.createdAt), 'MMMM yyyy')}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <CustomerDialog
            customer={customer}
            trigger={
              <Button variant="outline" className="w-full sm:w-auto">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Customer
              </Button>
            }
          />
          <Button 
            onClick={() => router.push(`/estimates/new?customerId=${customer.id}`)}
            className="w-full sm:w-auto"
          >
            Create Estimate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Sidebar Info */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${customer.email}`} className="hover:underline">
                  {customer.email}
                </a>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${customer.phone}`} className="hover:underline">
                  {customer.phone}
                </a>
              </div>
            )}
            {(customer.address || customer.city) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div>{customer.address}</div>
                  <div>
                    {customer.city}, {customer.state} {customer.zip}
                  </div>
                </div>
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {customer.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                )) || <span className="text-sm text-muted-foreground">No tags</span>}
              </div>
            </div>

            {customer.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {customer.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 md:gap-0">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="estimates" className="text-xs sm:text-sm">Estimates</TabsTrigger>
              <TabsTrigger value="jobs" className="text-xs sm:text-sm">Jobs</TabsTrigger>
              <TabsTrigger value="invoices" className="text-xs sm:text-sm">Invoices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{customer._count?.jobs || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Estimates</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{customer._count?.estimates || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{customer._count?.invoices || 0}</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Activity could go here */}
            </TabsContent>

            <TabsContent value="estimates" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Estimates</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.estimates?.length > 0 ? (
                    <div className="space-y-4">
                      {customer.estimates.map((estimate: any) => (
                        <div key={estimate.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div>
                            <div className="font-medium">{estimate.title}</div>
                            <div className="text-sm text-muted-foreground">
                              #{estimate.estimateNumber} • {format(new Date(estimate.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${estimate.total.toLocaleString()}</div>
                            <Badge variant="outline" className="uppercase text-xs">
                              {estimate.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No estimates found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.jobs?.length > 0 ? (
                    <div className="space-y-4">
                      {customer.jobs.map((job: any) => (
                        <div key={job.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div>
                            <div className="font-medium">{job.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {job.scheduledAt ? format(new Date(job.scheduledAt), 'MMM d, yyyy') : 'Unscheduled'}
                            </div>
                          </div>
                          <Badge variant="outline" className="uppercase text-xs">
                            {job.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No jobs found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.invoices?.length > 0 ? (
                    <div className="space-y-4">
                      {customer.invoices.map((invoice: any) => (
                        <div key={invoice.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div>
                            <div className="font-medium">Invoice #{invoice.invoiceNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${invoice.total.toLocaleString()}</div>
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'} className="uppercase text-xs">
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No invoices found.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

