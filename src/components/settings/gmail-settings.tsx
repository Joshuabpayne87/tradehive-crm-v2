'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export function GmailSettings() {
    const queryClient = useQueryClient()
    const [isConnecting, setIsConnecting] = useState(false)

    // Fetch company settings to check Gmail connection status
    const { data: company, isLoading } = useQuery({
        queryKey: ['company-settings'],
        queryFn: async () => {
            const res = await fetch('/api/settings/company')
            if (!res.ok) throw new Error('Failed to fetch company settings')
            return res.json()
        },
    })

    const connectMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/auth/google/connect')
            if (!res.ok) throw new Error('Failed to get authorization URL')
            const data = await res.json()
            return data.authUrl
        },
        onSuccess: (authUrl) => {
            // Redirect to Google OAuth
            window.location.href = authUrl
        },
    })

    const disconnectMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/auth/google/disconnect', { method: 'POST' })
            if (!res.ok) throw new Error('Failed to disconnect Gmail')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company-settings'] })
        },
    })

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const isConnected = company?.emailConnected

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Gmail Integration
                </CardTitle>
                <CardDescription>
                    Connect your Gmail account to send estimates and invoices from your own email address
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                        {isConnected ? (
                            <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium">Gmail Connected</p>
                                    <p className="text-sm text-muted-foreground">
                                        Emails will be sent from {company?.email || 'your Gmail account'}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Gmail Not Connected</p>
                                    <p className="text-sm text-muted-foreground">
                                        Connect Gmail to send emails from your account
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    <div>
                        {isConnected ? (
                            <Button
                                variant="outline"
                                onClick={() => disconnectMutation.mutate()}
                                disabled={disconnectMutation.isPending}
                            >
                                {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => connectMutation.mutate()}
                                disabled={connectMutation.isPending}
                            >
                                {connectMutation.isPending ? 'Connecting...' : 'Connect Gmail'}
                            </Button>
                        )}
                    </div>
                </div>

                {!isConnected && (
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p className="font-medium">Benefits of connecting Gmail:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Send from your own email address</li>
                            <li>Better email deliverability</li>
                            <li>Higher sending limits</li>
                            <li>More professional appearance</li>
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
