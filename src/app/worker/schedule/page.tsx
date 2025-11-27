'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { JobCard } from '@/components/worker/job-card'
import { format, startOfDay, isSameDay } from 'date-fns'
import { RefreshCw, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WorkerSchedulePage() {
  const queryClient = useQueryClient()

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['worker-schedule'],
    queryFn: async () => {
      const res = await fetch('/api/worker/schedule')
      if (!res.ok) throw new Error('Failed to fetch schedule')
      return res.json()
    },
  })

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['worker-schedule'] })
    refetch()
  }

  // Group jobs by date
  const groupedJobs = jobs?.reduce((acc: any, job: any) => {
    if (!job.scheduledAt) {
      const key = 'unscheduled'
      if (!acc[key]) acc[key] = []
      acc[key].push(job)
      return acc
    }

    const date = startOfDay(new Date(job.scheduledAt))
    const key = format(date, 'yyyy-MM-dd')
    if (!acc[key]) acc[key] = { date, jobs: [] }
    acc[key].jobs.push(job)
    return acc
  }, {})

  const sortedGroups = groupedJobs
    ? Object.entries(groupedJobs)
        .sort(([a], [b]) => {
          if (a === 'unscheduled') return 1
          if (b === 'unscheduled') return -1
          return a.localeCompare(b)
        })
        .map(([key, value]: [string, any]) => ({
          key,
          date: value.date || null,
          jobs: value.jobs || value,
        }))
    : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Schedule</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          className="min-h-[44px] min-w-[44px]"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>

      {sortedGroups.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-white/95 shadow-sm">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No jobs assigned</p>
          <p className="text-muted-foreground text-sm">
            Jobs assigned to you will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map((group) => (
            <div key={group.key}>
              {group.date && (
                <h2 className="text-lg font-semibold mb-3 text-foreground sticky top-16 bg-white/95 py-2 z-10">
                  {format(group.date, 'EEEE, MMMM d, yyyy')}
                </h2>
              )}
              {!group.date && (
                <h2 className="text-lg font-semibold mb-3 text-foreground sticky top-16 bg-white/95 py-2 z-10">
                  Unscheduled
                </h2>
              )}
              <div className="space-y-2">
                {group.jobs.map((job: any) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

