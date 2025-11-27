'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

const sizeMap = {
  sm: { width: 48, height: 48, text: 'text-base' },
  md: { width: 56, height: 56, text: 'text-lg' },
  lg: { width: 72, height: 72, text: 'text-2xl' },
}

export function Logo({ className = '', showText = true, size = 'md', href }: LogoProps) {
  const dimensions = sizeMap[size]
  // Start with static src to avoid hydration mismatch
  const [imgSrc, setImgSrc] = useState('/logo.png')
  const [hasError, setHasError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Add cache-busting only after mount to avoid hydration mismatch
    setImgSrc(`/logo.png?v=${Date.now()}&t=${Date.now()}`)
  }, [])
  
  const LogoContent = () => (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-shrink-0" style={{ width: dimensions.width, height: dimensions.height }}>
        {!hasError ? (
          <img
            src={imgSrc}
            alt="TradeHive Logo"
            width={dimensions.width}
            height={dimensions.height}
            className="object-contain w-full h-full"
            style={{ display: 'block' }}
            onError={() => {
              if (imgSrc.includes('.png')) {
                setImgSrc('/logo.svg?v=2')
              } else {
                setHasError(true)
              }
            }}
          />
        ) : (
          <div 
            className="rounded-full flex items-center justify-center font-bold text-primary w-full h-full"
            style={{ 
              backgroundColor: 'hsl(45, 100%, 85%)',
              color: 'hsl(142, 76%, 20%)'
            }}
          >
            TH
          </div>
        )}
      </div>
      {showText && (
        <span className={`font-bold ${dimensions.text} text-foreground`}>
          TradeHive
        </span>
      )}
    </div>
  )
  
  if (href) {
    return (
      <Link href={href}>
        <LogoContent />
      </Link>
    )
  }
  
  return <LogoContent />
}

