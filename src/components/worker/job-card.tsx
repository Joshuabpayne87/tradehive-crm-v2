'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { MapPin, Calendar, User, Clock } from 'lucide-react'
import Link from 'next/link'

interface JobCardProps {
  job: {
    id: string
    title: string
    status: string
    scheduledAt: Date | string | null
    address: string | null
    city: string | null
    state: string | null
    customer: {
      firstName: string
      lastName: string | null
    }
  }
}

export function JobCard({ job }: JobCardProps) {
  const statusColors = {
    scheduled: 'outline',
    in_progress: 'secondary',
    completed: 'default',
    cancelled: 'destructive',
  } as const

  return (
    <Link href={`/worker/schedule/${job.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer mb-3">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  <span>
                    {job.customer.firstName} {job.customer.lastName}
                  </span>
                </div>
              </div>
              <Badge variant={statusColors[job.status as keyof typeof statusColors] || 'outline'} className="uppercase text-xs">
                {job.status.replace('_', ' ')}
              </Badge>
            </div>

            {job.scheduledAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {format(new Date(job.scheduledAt), 'MMM d, yyyy @ h:mm a')}
                </span>
              </div>
            )}

            {(job.address || job.city) && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">
                  {job.address}
                  {job.address && job.city && ', '}
                  {job.city}
                  {job.city && job.state && ', '}
                  {job.state}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}



