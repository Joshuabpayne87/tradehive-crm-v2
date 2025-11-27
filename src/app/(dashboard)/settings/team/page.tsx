'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Plus, User, Trash2, Mail, Shield, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['tech', 'admin']),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

export default function TeamSettingsPage() {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: users, isLoading } = useQuery({
    queryKey: ['team-users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json()
    },
  })

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'tech' as const,
      password: '',
    },
  })

  const createUserMutation = useMutation({
    mutationFn: async (values: CreateUserFormValues) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create user')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-users'] })
      form.reset()
      setIsDialogOpen(false)
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete user')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-users'] })
    },
  })

  async function onSubmit(values: CreateUserFormValues) {
    await createUserMutation.mutateAsync(values)
  }

  const roleIcons = {
    owner: Shield,
    admin: Shield,
    tech: Wrench,
  }

  const roleColors = {
    owner: 'default',
    admin: 'secondary',
    tech: 'outline',
  } as const

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-6 md:space-y-8 px-2 md:px-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Add and manage team members for your company
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Create a new account for a worker or admin. They'll be able to log in with their email.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="worker@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tech">Worker (Tech)</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Leave empty for invite link"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        If no password is provided, an invite link will be sent (when email is configured)
                      </p>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create User
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading team members...</p>
        </div>
      ) : users?.length === 0 ? (
        <Card className="bg-white/95 shadow-sm">
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No team members yet</p>
            <p className="text-muted-foreground text-sm">
              Add your first team member to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users?.map((user: any) => {
            const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || User
            return (
              <Card key={user.id} className="bg-white/95 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <RoleIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{user.name}</span>
                          <Badge variant={roleColors[user.role as keyof typeof roleColors] || 'outline'}>
                            {user.role === 'tech' ? 'Worker' : user.role === 'admin' ? 'Admin' : 'Owner'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    {user.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${user.name} from the team?`)) {
                            deleteUserMutation.mutate(user.id)
                          }
                        }}
                        disabled={deleteUserMutation.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {createUserMutation.isError && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {createUserMutation.error?.message || 'Failed to create user'}
        </div>
      )}

      {deleteUserMutation.isError && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {deleteUserMutation.error?.message || 'Failed to delete user'}
        </div>
      )}
    </div>
  )
}


