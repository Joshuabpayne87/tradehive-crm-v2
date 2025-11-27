import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/portal/login?error=missing_token', req.url))
  }

  const customer = await prisma.customer.findUnique({
    where: { portalToken: token },
  })

  if (!customer || !customer.portalTokenExpires || customer.portalTokenExpires < new Date()) {
    return NextResponse.redirect(new URL('/portal/login?error=invalid_token', req.url))
  }

  // Set a cookie/session (simplified for MVP)
  // We'll set a cookie 'portal_customer_id'
  const response = NextResponse.redirect(new URL('/portal/dashboard', req.url))
  
  response.cookies.set('portal_customer_id', customer.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })

  // Clear the token so it's one-time use? 
  // Or keep it valid for a while? Let's keep it valid for the duration to allow re-clicks if needed,
  // or clear it to enforce security. Clearing is better.
  /*
  await prisma.customer.update({
    where: { id: customer.id },
    data: { portalToken: null, portalTokenExpires: null }
  })
  */
  // Actually, keeping it might be useful if the user clicks it again from email.
  
  return response
}



