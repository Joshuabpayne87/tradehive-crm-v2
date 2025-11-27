'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

interface StatusButtonProps {
  currentStatus: string
  targetStatus: 'in_progress' | 'completed'
  onUpdate: (status: string) => Promise<void>
  disabled?: boolean
}

export function StatusButton({ currentStatus, targetStatus, onUpdate, disabled }: StatusButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const buttonText = {
    in_progress: 'Start Job',
    completed: 'Complete Job',
  }[targetStatus]

  const canUpdate = {
    in_progress: currentStatus === 'scheduled',
    completed: currentStatus === 'scheduled' || currentStatus === 'in_progress',
  }[targetStatus]

  if (!canUpdate) {
    return null
  }

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onUpdate(targetStatus)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || disabled}
      className="w-full sm:w-auto min-h-[44px]"
      size="lg"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {buttonText}
    </Button>
  )
}



