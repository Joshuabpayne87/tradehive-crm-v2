'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { LeadDialog } from '@/components/leads/lead-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, User, Phone, Mail, Target, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { FilterBar } from '@/components/ui/filter-bar'

export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('newest')
  const router = useRouter()

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', search, status, sort],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('query', search)
      if (status) params.append('status', status)
      if (sort) params.append('sort', sort)
      const res = await fetch(`/api/leads?${params}`)
      if (!res.ok) throw new Error('Failed to fetch leads')
      return res.json()
    },
  })

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-4 md:space-y-6 px-2 md:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Leads</h1>
        <div className="w-full sm:w-auto">
          <LeadDialog />
        </div>
      </div>

      <FilterBar 
        placeholder="Search leads..."
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        statusOptions={[
          { label: 'New', value: 'new' },
          { label: 'Contacted', value: 'contacted' },
          { label: 'Qualified', value: 'qualified' },
          { label: 'Quoted', value: 'quoted' },
          { label: 'Won', value: 'won' },
          { label: 'Lost', value: 'lost' },
        ]}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { label: 'Newest', value: 'newest' },
          { label: 'Oldest', value: 'oldest' },
          { label: 'Name (A-Z)', value: 'name_asc' },
          { label: 'Name (Z-A)', value: 'name_desc' },
          { label: 'Status', value: 'status' },
        ]}
      />

      {isLoading ? (
        <div className="text-center py-10">Loading leads...</div>
      ) : leads?.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No leads found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {leads?.map((lead: any) => (
            <Link key={lead.id} href={`/leads/${lead.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold">{lead.firstName} {lead.lastName}</div>
                        <div className="text-xs text-muted-foreground">{lead.source}</div>
                      </div>
                    </div>
                    <Badge variant={lead.status === 'won' ? 'default' : 'outline'} className="capitalize">
                      {lead.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {lead.email && (
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="mr-2 h-3 w-3" />
                        {lead.email}
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="mr-2 h-3 w-3" />
                        {lead.phone}
                      </div>
                    )}
                  </div>

                  {lead.status !== 'won' && (
                    <div className="pt-2">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        View Details <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

