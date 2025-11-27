'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ArrowLeft, Pencil, Send, Printer, CreditCard, Paperclip, FileText, Download, Trash2 } from 'lucide-react'
import { FileUpload } from '@/components/ui/file-upload'

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${id}`)
      if (!res.ok) throw new Error('Failed to fetch invoice')
      return res.json()
    },
  })

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'invoice', id }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to send invoice')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      alert('Invoice sent successfully!')
    },
    onError: (error) => {
      alert(`Error sending invoice: ${error.message}`)
    }
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('entityId', id)
      formData.append('entityType', 'invoice')
      
      const res = await fetch('/api/attachments/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) throw new Error('Failed to upload file')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
    }
  })

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete attachment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
    }
  })

  const handleSend = () => {
    if (!invoice.customer.email) {
      alert('Customer does not have an email address.')
      return
    }
    if (confirm(`Send invoice to ${invoice.customer.email}?`)) {
      sendMutation.mutate()
    }
  }

  if (isLoading) return <div className="container mx-auto py-8">Loading...</div>
  if (!invoice) return <div>Invoice not found</div>

  const balanceDue = invoice.total - invoice.amountPaid

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
            <h1 className="text-3xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
            <Badge variant={
              invoice.status === 'paid' ? 'default' : 
              invoice.status === 'overdue' ? 'destructive' : 'outline'
            } className="uppercase">
              {invoice.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
           <Link href={`/invoices/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.open(`/api/invoices/${id}/pdf`, '_blank')}>
            <Printer className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button onClick={handleSend} disabled={sendMutation.isPending}>
            <Send className="mr-2 h-4 w-4" /> 
            {sendMutation.isPending ? 'Sending...' : 'Send'}
          </Button>
          {balanceDue > 0 && (
            <Link href={`/pay/${id}`} target="_blank">
              <Button>
                <CreditCard className="mr-2 h-4 w-4" /> Pay Online
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Invoice Document */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Invoice</CardTitle>
              <div className="text-muted-foreground mt-1">
                Issued on {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-sm text-muted-foreground">Due Date</div>
              <div className="font-bold">{invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'Due on Receipt'}</div>
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
              <div className="font-medium">{invoice.customer.firstName} {invoice.customer.lastName}</div>
              <div className="text-sm text-muted-foreground">
                {invoice.customer.address}<br />
                {invoice.customer.city}, {invoice.customer.state} {invoice.customer.zip}
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
              {invoice.lineItems.map((item: any) => (
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
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({invoice.taxRate}%)</span>
                <span>${invoice.tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${invoice.total.toFixed(2)}</span>
              </div>
              
              {invoice.amountPaid > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid</span>
                  <span>-${invoice.amountPaid.toFixed(2)}</span>
                </div>
              )}
              
              {balanceDue > 0 ? (
                <div className="flex justify-between font-bold text-lg border-t pt-2 text-red-600">
                  <span>Balance Due</span>
                  <span>${balanceDue.toFixed(2)}</span>
                </div>
              ) : (
                <div className="text-center text-green-600 font-bold border-t pt-2">
                  PAID IN FULL
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="mt-8 border-t pt-8">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Paperclip className="h-4 w-4" /> Attachments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {invoice.attachments?.map((file: any) => (
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
          {invoice.notes && (
            <div className="bg-muted/30 p-4 rounded-lg text-sm">
              <h4 className="font-medium mb-1">Payment Instructions</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


