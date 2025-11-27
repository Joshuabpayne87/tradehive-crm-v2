'use client'

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ArrowLeft, MapPin, Calendar, User, Phone, Mail, FileText, DollarSign, Pencil, Paperclip, Download, Trash2 } from 'lucide-react'
import { JobDialog } from '@/components/jobs/job-dialog' // We might need to update JobDialog to accept initialData
import { JobForm } from '@/components/jobs/job-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'
import { FileUpload } from '@/components/ui/file-upload'

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${id}`)
      if (!res.ok) throw new Error('Failed to fetch job')
      return res.json()
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('entityId', id)
      formData.append('entityType', 'job')

      const res = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Failed to upload file')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] })
    }
  })

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete attachment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] })
    }
  })

  if (isLoading) return <div className="container mx-auto py-8">Loading...</div>
  if (!job) return <div>Job not found</div>

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="pl-0" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <Badge variant={
              job.status === 'completed' ? 'default' :
                job.status === 'in_progress' ? 'secondary' :
                  job.status === 'cancelled' ? 'destructive' : 'outline'
            } className="uppercase text-sm">
              {job.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" /> Edit Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Job</DialogTitle>
              </DialogHeader>
              <JobForm initialData={job} onSuccess={() => setIsEditOpen(false)} />
            </DialogContent>
          </Dialog>

          <Button onClick={() => router.push(`/invoices/new?jobId=${job.id}&customerId=${job.customerId}`)}>
            Create Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="whitespace-pre-wrap">{job.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Scheduled Date</div>
                    <div className="text-sm text-muted-foreground">
                      {job.scheduledAt ? format(new Date(job.scheduledAt), 'PPPP @ p') : 'Unscheduled'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-sm text-muted-foreground">
                      {job.address || 'No address provided'}
                      {job.city && <br />}
                      {job.city ? `${job.city}, ${job.state} ${job.zip}` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {job.assignedTo && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Assigned To</h3>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{job.assignedTo.name || job.assignedTo.email}</span>
                    </div>
                  </div>
                </>
              )}

              {job.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Internal Notes</h3>
                    <p className="text-sm bg-yellow-50 p-3 rounded-md border border-yellow-100">
                      {job.notes}
                    </p>
                  </div>
                </>
              )}

              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Attachments
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {job.attachments?.map((file: any) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate text-sm" title={file.fileName}>{file.fileName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(file.fileUrl, '_blank')}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteAttachmentMutation.mutate(file.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <FileUpload onUpload={(file) => uploadMutation.mutateAsync(file)} isUploading={uploadMutation.isPending} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
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
                  <Link href={`/customers/${job.customerId}`} className="text-xs text-blue-600 hover:underline">
                    View Profile
                  </Link>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                {job.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${job.customer.phone}`} className="hover:underline">
                      {job.customer.phone}
                    </a>
                  </div>
                )}
                {job.customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${job.customer.email}`} className="hover:underline">
                      {job.customer.email}
                    </a>
                  </div>
                )}
                {job.customer.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      {job.customer.address}<br />
                      {job.customer.city}, {job.customer.state}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {job.invoices?.length > 0 ? (
                <div className="space-y-4">
                  {job.invoices.map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <Link href={`/invoices/${invoice.id}`} className="hover:underline font-medium">
                          #{invoice.invoiceNumber}
                        </Link>
                      </div>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'} className="text-xs">
                        {invoice.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No invoices linked to this job.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

