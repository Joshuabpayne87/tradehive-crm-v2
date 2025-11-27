'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { EstimateBuilder } from '@/components/estimates/estimate-builder'

export default function EditEstimatePage() {
  const params = useParams()
  const id = params.id as string

  const { data: estimate, isLoading } = useQuery({
    queryKey: ['estimate', id],
    queryFn: async () => {
      const res = await fetch(`/api/estimates/${id}`)
      if (!res.ok) throw new Error('Failed to fetch estimate')
      return res.json()
    },
  })

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Edit Estimate #{estimate.estimateNumber}</h1>
      <EstimateBuilder initialData={estimate} />
    </div>
  )
}



