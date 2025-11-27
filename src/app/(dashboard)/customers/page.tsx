'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { CustomerDialog } from '@/components/customers/customer-dialog'
import { Button } from '@/components/ui/button'
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
import { User, Phone, Mail, MapPin, Trash2, Download } from 'lucide-react'
import { useState } from 'react'
import { FilterBar } from '@/components/ui/filter-bar'

interface Customer {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  _count: {
    jobs: number
    estimates: number
    invoices: number
  }
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const queryClient = useQueryClient()

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ['customers', search, sort],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('query', search)
      if (sort) params.append('sort', sort)
      const res = await fetch(`/api/customers?${params}`)
      if (!res.ok) throw new Error('Failed to fetch customers')
      return res.json()
    },
    refetchInterval: 60000,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete customer')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  const handleExport = () => {
    const params = new URLSearchParams()
    if (search) params.append('query', search)
    if (sort) params.append('sort', sort)
    window.open(`/api/customers/export?${params}`, '_blank')
  }

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-4 md:space-y-6 px-2 md:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <div className="w-full sm:w-auto">
            <CustomerDialog />
          </div>
        </div>
      </div>

      <FilterBar
        placeholder="Search customers..."
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { label: 'Newest', value: 'newest' },
          { label: 'Oldest', value: 'oldest' },
          { label: 'Name (A-Z)', value: 'name_asc' },
          { label: 'Name (Z-A)', value: 'name_desc' },
        ]}
      />

      {isLoading ? (
        <div className="text-center py-10">Loading customers...</div>
      ) : customers?.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No customers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {customers?.map((customer) => (
            <Card key={customer.id} className="hover:bg-muted/50 transition-colors h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <Link href={`/customers/${customer.id}`} className="flex items-center gap-2 flex-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <span>
                      {customer.firstName} {customer.lastName}
                    </span>
                  </Link>
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
                        <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {customer.firstName} {customer.lastName}?
                          {(customer._count.jobs > 0 || customer._count.estimates > 0 || customer._count.invoices > 0) && (
                            <span className="block mt-2 text-destructive font-medium">
                              This customer has {customer._count.jobs} jobs, {customer._count.estimates} estimates, and {customer._count.invoices} invoices.
                            </span>
                          )}
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(customer.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {customer.email && (
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="mr-2 h-3 w-3" />
                    {customer.email}
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="mr-2 h-3 w-3" />
                    {customer.phone}
                  </div>
                )}
                {(customer.city || customer.state) && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-3 w-3" />
                    {customer.city}{customer.city && customer.state ? ', ' : ''}{customer.state}
                  </div>
                )}
                <div className="pt-2 flex gap-4 text-xs text-muted-foreground border-t mt-2">
                  <div>{customer._count.jobs} Jobs</div>
                  <div>{customer._count.estimates} Estimates</div>
                  <div>{customer._count.invoices} Invoices</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

