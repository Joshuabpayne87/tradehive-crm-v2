'use client'

import { useSearchParams } from 'next/navigation'
import { InvoiceBuilder } from '@/components/invoices/invoice-builder'
import { Suspense } from 'react'

function NewInvoiceContent() {
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customerId') || undefined

  return (
    <div className="container mx-auto py-4 md:py-8 max-w-5xl px-2 md:px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Create New Invoice</h1>
      <InvoiceBuilder customerId={customerId} />
    </div>
  )
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewInvoiceContent />
    </Suspense>
  )
}

