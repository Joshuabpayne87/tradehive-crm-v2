'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { InvoiceBuilder } from '@/components/invoices/invoice-builder'

export default function EditInvoicePage() {
  const params = useParams()
  const id = params.id as string

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${id}`)
      if (!res.ok) throw new Error('Failed to fetch invoice')
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Edit Invoice #{invoice.invoiceNumber}</h1>
      <InvoiceBuilder initialData={invoice} />
    </div>
  )
}



