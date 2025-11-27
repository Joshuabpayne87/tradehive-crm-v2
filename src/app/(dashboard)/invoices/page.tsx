'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Search, Trash2, Download, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { FilterBar } from '@/components/ui/filter-bar'
import { DateRange } from 'react-day-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InvoicesPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sort, setSort] = useState('newest')

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', status, dateRange, sort],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (sort) params.append('sort', sort)
      if (dateRange?.from) params.append('startDate', dateRange.from.toISOString())
      if (dateRange?.to) params.append('endDate', dateRange.to.toISOString())
      const res = await fetch(`/api/invoices?${params}`)
      if (!res.ok) throw new Error('Failed to fetch invoices')
      return res.json()
    },
    refetchInterval: 60000,
  })

  const { data: recurringInvoices, isLoading: isRecurringLoading } = useQuery({
    queryKey: ['recurringInvoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices/recurring')
      if (!res.ok) throw new Error('Failed to fetch recurring invoices')
      return res.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete invoice')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })

  const handleExport = () => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (sort) params.append('sort', sort)
    if (dateRange?.from) params.append('startDate', dateRange.from.toISOString())
    if (dateRange?.to) params.append('endDate', dateRange.to.toISOString())
    window.open(`/api/invoices/export?${params}`, '_blank')
  }

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-4 md:space-y-6 px-2 md:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Invoices</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Link href="/invoices/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="space-y-4">
          <FilterBar 
            status={status}
            onStatusChange={setStatus}
            statusOptions={[
              { label: 'Draft', value: 'draft' },
              { label: 'Sent', value: 'sent' },
              { label: 'Viewed', value: 'viewed' },
              { label: 'Paid', value: 'paid' },
              { label: 'Partial', value: 'partial' },
              { label: 'Overdue', value: 'overdue' },
              { label: 'Void', value: 'void' },
            ]}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            sort={sort}
            onSortChange={setSort}
            sortOptions={[
              { label: 'Newest', value: 'newest' },
              { label: 'Oldest', value: 'oldest' },
              { label: 'Amount (High-Low)', value: 'amount_desc' },
              { label: 'Amount (Low-High)', value: 'amount_asc' },
              { label: 'Status', value: 'status' },
            ]}
          />

          {isLoading ? (
            <div className="text-center py-10">Loading invoices...</div>
          ) : invoices?.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No invoices found.</p>
              <Link href="/invoices/new">
                <Button variant="link" className="mt-2">Create your first invoice</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {invoices?.map((invoice: any) => (
                <Card key={invoice.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                      <Link href={`/invoices/${invoice.id}`} className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">Invoice #{invoice.invoiceNumber}</span>
                          <Badge variant={
                            invoice.status === 'paid' ? 'default' : 
                            invoice.status === 'overdue' ? 'destructive' : 
                            'outline'
                          } className="uppercase">
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">
                          for <span className="font-medium text-foreground">{invoice.customer.firstName} {invoice.customer.lastName}</span>
                        </div>
                      </Link>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col md:items-end gap-1">
                          <div className="font-bold text-xl">${invoice.total.toLocaleString()}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Due {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}</span>
                            {invoice.amountPaid > 0 && invoice.amountPaid < invoice.total && (
                              <span className="text-orange-600 font-medium text-xs px-2 py-0.5 bg-orange-100 rounded-full">
                                Partial
                              </span>
                            )}
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete invoice #{invoice.invoiceNumber}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(invoice.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recurring">
          {isRecurringLoading ? (
            <div className="text-center py-10">Loading recurring invoices...</div>
          ) : recurringInvoices?.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/10">
              <p className="text-muted-foreground">No recurring invoices found.</p>
              <Button variant="outline" className="mt-4" disabled>
                <RefreshCw className="mr-2 h-4 w-4" />
                Create Recurring Invoice
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                (Create recurring invoices from existing invoices via API for now)
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {recurringInvoices?.map((recurring: any) => (
                <Card key={recurring.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                      <div>
                        <div className="font-bold text-lg flex items-center gap-2">
                          {recurring.customer.firstName} {recurring.customer.lastName}
                          <Badge variant="outline" className="capitalize">{recurring.frequency}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Next Run: {format(new Date(recurring.nextRunDate), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={recurring.isActive ? 'default' : 'secondary'}>
                          {recurring.isActive ? 'Active' : 'Paused'}
                        </Badge>
                        {recurring.invoices.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Last: #{recurring.invoices[0].invoiceNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

