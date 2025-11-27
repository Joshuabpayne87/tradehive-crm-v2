'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Calendar,
  Target,
  CreditCard,
  Settings,
  Menu,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
// import { useStackApp } from '@stackframe/stack' // Temporarily disabled

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/leads', label: 'Leads', icon: Target },
  { href: '/estimates', label: 'Estimates', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: DollarSign },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/accounting', label: 'Accounting', icon: CreditCard },
  { href: '/settings/company', label: 'Settings', icon: Settings },
  { href: '/settings/team', label: 'Team', icon: Users },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // const stackApp = useStackApp() // Temporarily disabled
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b">
        <Logo size="md" href="/dashboard" />
      </div>
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={async () => {
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
                }}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden h-16 border-b glass-strong flex items-center px-4 justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 glass-strong">
              <NavContent />
            </SheetContent>
          </Sheet>
          <Logo size="sm" href="/dashboard" />
        </div>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 glass-strong border-r h-full flex-shrink-0">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
