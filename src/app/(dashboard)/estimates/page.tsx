'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Search, FileText, Trash2, Download } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { FilterBar } from '@/components/ui/filter-bar'
import { DateRange } from 'react-day-picker'

export default function EstimatesPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sort, setSort] = useState('newest')

  const { data: estimates, isLoading } = useQuery({
    queryKey: ['estimates', status, dateRange, sort],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (sort) params.append('sort', sort)
      if (dateRange?.from) params.append('startDate', dateRange.from.toISOString())
      if (dateRange?.to) params.append('endDate', dateRange.to.toISOString())
      
      const res = await fetch(`/api/estimates?${params}`)
      if (!res.ok) throw new Error('Failed to fetch estimates')
      return res.json()
    },
    refetchInterval: 60000,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/estimates/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete estimate')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] })
    },
  })

  const handleExport = () => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (sort) params.append('sort', sort)
    if (dateRange?.from) params.append('startDate', dateRange.from.toISOString())
    if (dateRange?.to) params.append('endDate', dateRange.to.toISOString())
    window.open(`/api/estimates/export?${params}`, '_blank')
  }

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-4 md:space-y-6 px-2 md:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Estimates</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Link href="/estimates/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Estimate
            </Button>
          </Link>
        </div>
      </div>

      <FilterBar 
        status={status}
        onStatusChange={setStatus}
        statusOptions={[
          { label: 'Draft', value: 'draft' },
          { label: 'Sent', value: 'sent' },
          { label: 'Viewed', value: 'viewed' },
          { label: 'Approved', value: 'approved' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'Expired', value: 'expired' },
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
        <div className="text-center py-10">Loading estimates...</div>
      ) : estimates?.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No estimates found.</p>
          <Link href="/estimates/new">
            <Button variant="link" className="mt-2">Create your first estimate</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {estimates?.map((estimate: any) => (
            <Card key={estimate.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                  <Link href={`/estimates/${estimate.id}`} className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{estimate.title}</span>
                      <Badge variant="outline">#{estimate.estimateNumber}</Badge>
                    </div>
                    <div className="text-muted-foreground">
                      for <span className="font-medium text-foreground">{estimate.customer.firstName} {estimate.customer.lastName}</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col md:items-end gap-1">
                      <div className="font-bold text-xl">${estimate.total.toLocaleString()}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{format(new Date(estimate.createdAt), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <Badge variant={
                          estimate.status === 'approved' ? 'default' : 
                          estimate.status === 'rejected' ? 'destructive' : 'secondary'
                        } className="uppercase text-xs">
                          {estimate.status}
                        </Badge>
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
                          <AlertDialogTitle>Delete Estimate</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete estimate #{estimate.estimateNumber}?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(estimate.id)}
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
    </div>
  )
}

