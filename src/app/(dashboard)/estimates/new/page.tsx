'use client'

import { useSearchParams } from 'next/navigation'
import { EstimateBuilder } from '@/components/estimates/estimate-builder'
import { Suspense } from 'react'

function NewEstimateContent() {
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customerId') || undefined

  return (
    <div className="container mx-auto py-4 md:py-8 max-w-5xl px-2 md:px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Create New Estimate</h1>
      <EstimateBuilder customerId={customerId} />
    </div>
  )
}

export default function NewEstimatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewEstimateContent />
    </Suspense>
  )
}

