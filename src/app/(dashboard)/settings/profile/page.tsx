'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn('Supabase not configured, skipping auth check')
          setLoading(false)
          return
        }

        const supabase = createClient()
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Supabase auth error:', error)
          setLoading(false)
          return
        }
        
        if (authUser) {
          // Fetch additional user data from our database
          const res = await fetch('/api/users/me')
          if (res.ok) {
            const dbUser = await res.json()
            setUser({ ...authUser, ...dbUser })
          } else {
            setUser(authUser)
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  if (loading) {
    return <div className="container mx-auto py-8 max-w-2xl">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            Manage your personal account details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={user?.user_metadata?.full_name || user?.name || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          {user?.role && (
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user.role} disabled />
            </div>
          )}
          
          <div className="pt-4">
            <Button variant="outline" disabled>Change Password (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
