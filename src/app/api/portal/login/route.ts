import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-helpers'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return errorResponse('Email is required', 400)
    }

    // Find customer by email
    // Note: Email might not be unique across companies, so this is a simplified "Magic Link" 
    // that might just pick the most recent or require more info.
    // For MVP/Solo Plan focus, we'll assume the user knows which company they are interacting with 
    // OR we just find the first match.
    
    // Ideally, the portal is company-specific (e.g. subdomain or /portal/company-slug), 
    // but we are building a general platform.
    // Let's find the first customer with this email.
    const customer = await prisma.customer.findFirst({
      where: { email },
      include: { company: true }
    })

    if (!customer) {
      // Return success even if not found to prevent email enumeration
      return successResponse({ message: 'If an account exists, a link has been sent.' })
    }

    // Generate Token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        portalToken: token,
        portalTokenExpires: expires
      }
    })

    // In a real app, we would send an email here.
    // For MVP Demo, we'll return the link in the response so we can click it.
    const link = `${process.env.NEXTAUTH_URL}/portal/verify?token=${token}`
    
    console.log('Magic Link generated:', link)

    return successResponse({ 
      message: 'Link sent',
      // INSECURE: Returning link for demo purposes only
      debugLink: link 
    })
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to send magic link', 500)
  }
}



