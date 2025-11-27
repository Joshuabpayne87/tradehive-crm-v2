'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: false,
          },
        },
      })
  )

  // StackProvider disabled due to React 18/19 compatibility issues
  // Using server-side authentication only via API routes
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

