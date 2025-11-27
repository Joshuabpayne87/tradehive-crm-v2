import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PortalEstimateDetail from './portal-estimate-client'

export default async function PortalEstimatePage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const customerId = cookieStore.get('portal_customer_id')?.value
  const { id } = await params

  if (!customerId) {
    redirect('/portal/login')
  }

  const estimate = await prisma.estimate.findFirst({
    where: { 
      id,
      customerId // Ensure the estimate belongs to the logged-in customer
    },
    include: {
      company: true,
      customer: true,
      lineItems: true,
    },
  })

  if (!estimate) {
    notFound()
  }

  return <PortalEstimateDetail estimate={estimate} />
}



