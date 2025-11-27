import Stripe from 'stripe'

// Lazy initialization to avoid build-time errors
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'
    _stripe = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover' as any,
      typescript: true,
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return getStripe()[prop as keyof Stripe]
  }
})

export function getStripeFee(amount: number, pricingModel: 'pass_through' | 'standard' | null) {
  // Standard pricing: 2.9% + 30c (Merchant pays)
  // Pass-through: Customer pays fee so merchant gets full amount
  
  if (pricingModel === 'pass_through') {
    // Calculate amount to charge customer so that net = original amount
    // Net = (Charge - 0.30) / (1 - 0.029)
    // This is an approximation, Stripe Connect fees can be complex
    // For MVP, we'll keep it simple: 
    const fee = (amount + 30) / (1 - 0.029) - amount
    return Math.ceil(fee)
  }

  return 0 // Merchant absorbs fee from their payout
}


