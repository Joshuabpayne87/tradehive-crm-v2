'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Calendar, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Check if user is a worker
  const { data: user, isLoading } = useQuery({
    queryKey: ['worker-user'],
    queryFn: async () => {
      const res = await fetch('/api/users/me')
      if (!res.ok) throw new Error('Failed to fetch user')
      const data = await res.json()
      
      if (data.role !== 'tech') {
        router.push('/dashboard')
        return null
      }
      
      setIsAuthorized(true)    
      return data
    },
    retry: false,
  })

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/signout', { method: 'POST' })
      if (res.ok) {
        window.location.href = '/login'
      } else {
        window.location.href = '/login'
      }
    } catch {
      window.location.href = '/login'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized || !user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-50 to-green-50">
      {/* Header */}
      <header className="glass-strong border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo size="sm" showText={true} />
          <div className="text-sm text-muted-foreground">
            {user.name || user.email}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 py-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/worker/schedule"
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              pathname?.startsWith('/worker/schedule')
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Calendar className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Schedule</span>
          </Link>
          
          <Link
            href="/worker/profile"
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              pathname === '/worker/profile'
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <User className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

