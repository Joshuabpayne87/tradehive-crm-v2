'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LeadForm } from '@/components/leads/lead-form'
import { ArrowLeft, Pencil, Loader2, UserPlus, Mail, Phone, Target } from 'lucide-react'
import { useState } from 'react'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const queryClient = useQueryClient()

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const res = await fetch(`/api/leads/${id}`)
      if (!res.ok) throw new Error('Failed to fetch lead')
      return res.json()
    },
  })

  const convertMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/leads/${id}/convert`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to convert lead')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      router.push(`/customers/${data.customer.id}`)
    },
  })

  const handleConvert = async () => {
    if (!confirm('Are you sure you want to convert this lead to a customer?')) return
    setIsConverting(true)
    try {
      await convertMutation.mutateAsync()
    } finally {
      setIsConverting(false)
    }
  }

  if (isLoading) return <div className="container mx-auto py-8">Loading...</div>
  if (!lead) return <div>Lead not found</div>

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="pl-0" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{lead.firstName} {lead.lastName}</h1>
            <Badge variant={lead.status === 'won' ? 'default' : 'outline'} className="uppercase text-sm">
              {lead.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Lead</DialogTitle>
              </DialogHeader>
              <LeadForm initialData={lead} onSuccess={() => setIsEditOpen(false)} />
            </DialogContent>
          </Dialog>
          
          {lead.status !== 'won' && (
            <Button onClick={handleConvert} disabled={isConverting}>
              {isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Convert to Customer
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Source</div>
                <div className="text-sm text-muted-foreground">{lead.source}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Email</div>
                <a href={`mailto:${lead.email}`} className="text-sm text-blue-600 hover:underline">{lead.email}</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Phone</div>
                <a href={`tel:${lead.phone}`} className="text-sm text-blue-600 hover:underline">{lead.phone}</a>
              </div>
            </div>
          </div>

          {lead.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                <p className="whitespace-pre-wrap text-sm">{lead.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



