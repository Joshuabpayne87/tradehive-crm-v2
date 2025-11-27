'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WorkerProfilePage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['worker-user'],
    queryFn: async () => {
      const res = await fetch('/api/users/me')
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
  })

  const { data: company } = useQuery({
    queryKey: ['company'],
    queryFn: async () => {
      const res = await fetch('/api/settings/company')
      if (!res.ok) return null
      return res.json()
    },
    enabled: !!user,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card className="bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="font-medium text-lg">
                {user?.name || 'No name set'}
              </div>
              <div className="text-sm text-muted-foreground">Worker</div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </div>
            </div>

            {company && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Company</div>
                  <div className="text-sm text-muted-foreground">{company.name}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

