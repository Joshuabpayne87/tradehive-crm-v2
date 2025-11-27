'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, MapPin, Calendar, User, Phone, Mail, FileText, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusButton } from '@/components/worker/status-button'
import Link from 'next/link'

export default function WorkerJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string

  const { data: job, isLoading } = useQuery({
    queryKey: ['worker-job', id],
    queryFn: async () => {
      const res = await fetch(`/api/worker/jobs/${id}`)
      if (!res.ok) throw new Error('Failed to fetch job')
      return res.json()
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/worker/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update job status')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-job', id] })
      queryClient.invalidateQueries({ queryKey: ['worker-schedule'] })
    },
  })

  const handleStatusUpdate = async (status: string) => {
    await updateStatusMutation.mutateAsync(status)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const statusColors = {
    scheduled: 'outline',
    in_progress: 'secondary',
    completed: 'default',
    cancelled: 'destructive',
  } as const

  const address = [job.address, job.city, job.state, job.zip].filter(Boolean).join(', ')
  const mapsUrl = address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : null

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <Badge
            variant={statusColors[job.status as keyof typeof statusColors] || 'outline'}
            className="mt-1 uppercase"
          >
            {job.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <StatusButton
          currentStatus={job.status}
          targetStatus="in_progress"
          onUpdate={handleStatusUpdate}
        />
        <StatusButton
          currentStatus={job.status}
          targetStatus="completed"
          onUpdate={handleStatusUpdate}
        />
      </div>

      {/* Job Details */}
      <Card className="bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {job.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {job.scheduledAt && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">Scheduled</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(job.scheduledAt), 'PPPP @ p')}
                </div>
              </div>
            </div>
          )}

          {address && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Location</div>
                <div className="text-sm text-muted-foreground">{address}</div>
                {mapsUrl && (
                  <Link href={mapsUrl} target="_blank" className="mt-2 inline-block">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Navigation className="mr-2 h-4 w-4" />
                      Get Directions
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {job.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Internal Notes</h3>
              <p className="text-sm bg-yellow-50 p-3 rounded-md border border-yellow-100">
                {job.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card className="bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">
                {job.customer.firstName} {job.customer.lastName}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {job.customer.phone && (
              <Link
                href={`tel:${job.customer.phone}`}
                className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{job.customer.phone}</span>
              </Link>
            )}
            {job.customer.email && (
              <Link
                href={`mailto:${job.customer.email}`}
                className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{job.customer.email}</span>
              </Link>
            )}
            {job.customer.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  {job.customer.address}
                  {job.customer.city && (
                    <>
                      <br />
                      {job.customer.city}
                      {job.customer.state && `, ${job.customer.state}`}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

