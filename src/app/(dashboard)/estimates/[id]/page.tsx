'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ArrowLeft, Pencil, Send, Printer, CheckCircle, XCircle, FileText, Paperclip, Download, Trash2 } from 'lucide-react'
import { FileUpload } from '@/components/ui/file-upload'

export default function EstimateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string

  const { data: estimate, isLoading } = useQuery({
    queryKey: ['estimate', id],
    queryFn: async () => {
      const res = await fetch(`/api/estimates/${id}`)
      if (!res.ok) throw new Error('Failed to fetch estimate')
      return res.json()
    },
  })

  const convertMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/estimates/${id}/convert`, { method: 'POST' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to convert estimate')
      }
      return res.json()
    },
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ['estimates'] })
      queryClient.invalidateQueries({ queryKey: ['estimate', id] })
      router.push(`/invoices/${invoice.id}`)
    },
  })

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'estimate', id }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to send estimate')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimate', id] })
      alert('Estimate sent successfully!')
    },
    onError: (error) => {
      alert(`Error sending estimate: ${error.message}`)
    }
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('entityId', id)
      formData.append('entityType', 'estimate')
      
      const res = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) throw new Error('Failed to upload file')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimate', id] })
    }
  })

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete attachment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimate', id] })
    }
  })

  const handleConvert = () => {
    if (confirm('Convert this estimate to an invoice? This will create a new invoice and mark the estimate as approved.')) {
      convertMutation.mutate()
    }
  }

  const handleSend = () => {
    if (!estimate.customer.email) {
      alert('Customer does not have an email address.')
      return
    }
    if (confirm(`Send estimate to ${estimate.customer.email}?`)) {
      sendMutation.mutate()
    }
  }

  if (isLoading) return <div className="container mx-auto py-8">Loading...</div>
  if (!estimate) return <div>Estimate not found</div>

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" className="pl-0" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Estimate #{estimate.estimateNumber}</h1>
            <Badge variant={
              estimate.status === 'approved' ? 'default' : 
              estimate.status === 'rejected' ? 'destructive' : 'outline'
            } className="uppercase">
              {estimate.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/estimates/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.open(`/api/estimates/${id}/pdf`, '_blank')}>
            <Printer className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button onClick={handleSend} disabled={sendMutation.isPending}>
            <Send className="mr-2 h-4 w-4" /> 
            {sendMutation.isPending ? 'Sending...' : 'Send'}
          </Button>
          {estimate.status !== 'approved' && (
            <Button 
              onClick={handleConvert}
              disabled={convertMutation.isPending}
            >
              <FileText className="mr-2 h-4 w-4" />
              {convertMutation.isPending ? 'Converting...' : 'Convert to Invoice'}
            </Button>
          )}
        </div>
      </div>

      {/* Estimate Document */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{estimate.title}</CardTitle>
              <div className="text-muted-foreground mt-1">
                Created on {format(new Date(estimate.createdAt), 'MMM d, yyyy')}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-sm text-muted-foreground">Valid Until</div>
              <div>{estimate.validUntil ? format(new Date(estimate.validUntil), 'MMM d, yyyy') : 'No expiration'}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">From</h3>
              <div className="font-medium">TradeHive Demo Co.</div>
              <div className="text-sm text-muted-foreground">
                123 Business Rd<br />
                City, ST 12345
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Bill To</h3>
              <div className="font-medium">{estimate.customer.firstName} {estimate.customer.lastName}</div>
              <div className="text-sm text-muted-foreground">
                {estimate.customer.address}<br />
                {estimate.customer.city}, {estimate.customer.state} {estimate.customer.zip}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-medium text-muted-foreground px-4">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            <div className="space-y-2">
              {estimate.lineItems.map((item: any) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 py-4 border-b px-4 last:border-0">
                  <div className="col-span-6 font-medium">{item.description}</div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right">${item.rate.toFixed(2)}</div>
                  <div className="col-span-2 text-right">${item.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${estimate.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({estimate.taxRate}%)</span>
                <span>${estimate.tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${estimate.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Paperclip className="h-4 w-4" /> Attachments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {estimate.attachments?.map((file: any) => (
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

          {/* Notes */}
          {estimate.notes && (
            <div className="bg-muted/30 p-4 rounded-lg text-sm">
              <h4 className="font-medium mb-1">Notes & Terms</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{estimate.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


