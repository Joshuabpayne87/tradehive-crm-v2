'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { JobDialog } from '@/components/jobs/job-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Briefcase, MapPin, Calendar, User } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { FilterBar } from '@/components/ui/filter-bar'
import { DateRange } from 'react-day-picker'

export default function JobsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sort, setSort] = useState('scheduled_asc')

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', status, dateRange, sort],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (sort) params.append('sort', sort)
      if (dateRange?.from) params.append('startDate', dateRange.from.toISOString())
      if (dateRange?.to) params.append('endDate', dateRange.to.toISOString())
      
      const res = await fetch(`/api/jobs?${params}`)
      if (!res.ok) throw new Error('Failed to fetch jobs')
      return res.json()
    },
  })

  // Client-side filter for search
  const filteredJobs = jobs?.filter((job: any) => 
    !search ||
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.customer.firstName.toLowerCase().includes(search.toLowerCase()) ||
    job.customer.lastName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-4 md:space-y-6 px-2 md:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Jobs</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/schedule" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar View
            </Button>
          </Link>
          <div className="w-full sm:w-auto">
            <JobDialog />
          </div>
        </div>
      </div>

      <FilterBar 
        placeholder="Search jobs..."
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        statusOptions={[
          { label: 'Scheduled', value: 'scheduled' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
        ]}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        sort={sort}
        onSortChange={setSort}
        sortOptions={[
          { label: 'Scheduled (Earliest)', value: 'scheduled_asc' },
          { label: 'Scheduled (Latest)', value: 'scheduled_desc' },
          { label: 'Newest Created', value: 'newest' },
          { label: 'Oldest Created', value: 'oldest' },
          { label: 'Status', value: 'status' },
        ]}
      />

      {isLoading ? (
        <div className="text-center py-10">Loading jobs...</div>
      ) : filteredJobs?.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">No jobs found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs?.map((job: any) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{job.title}</span>
                        <Badge variant={
                          job.status === 'completed' ? 'default' : 
                          job.status === 'in_progress' ? 'secondary' : 
                          job.status === 'cancelled' ? 'destructive' : 'outline'
                        } className="uppercase text-xs">
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{job.customer.firstName} {job.customer.lastName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{job.scheduledAt ? format(new Date(job.scheduledAt), 'MMM d, yyyy @ h:mm a') : 'Unscheduled'}</span>
                        </div>
                         {(job.address || job.city) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{job.address}, {job.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

