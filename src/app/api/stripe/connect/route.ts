import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyId, getAuthenticatedSession, errorResponse, successResponse } from '@/lib/api-helpers'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Initiate Stripe Connect Onboarding
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession()
    const companyId = (session.user as any).companyId

    // 1. Get or create Stripe Account
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company) return errorResponse('Company not found', 404)

    let accountId = company.stripeAccountId

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: company.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      accountId = account.id

      await prisma.company.update({
        where: { id: companyId },
        data: { stripeAccountId: accountId }
      })
    }

    // 2. Create Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXTAUTH_URL}/settings/payments?refresh=true`,
      return_url: `${process.env.NEXTAUTH_URL}/settings/payments?success=true`,
      type: 'account_onboarding',
    })

    return successResponse({ url: accountLink.url })
  } catch (error) {
    console.error('Stripe Connect Error:', error)
    return errorResponse('Failed to initiate Stripe Connect', 500)
  }
}

// Create Login Link for Stripe Dashboard
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession()
    const companyId = (session.user as any).companyId

    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company?.stripeAccountId) {
      return errorResponse('Stripe account not connected', 400)
    }

    const loginLink = await stripe.accounts.createLoginLink(company.stripeAccountId)

    return successResponse({ url: loginLink.url })
  } catch (error) {
    return errorResponse('Failed to create login link', 500)
  }
}


