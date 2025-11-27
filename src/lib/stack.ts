import { StackServerApp } from '@stackframe/stack'

// Initialize Stack Auth server app (lazy initialization to avoid build-time errors)
let _stackServerApp: StackServerApp | null = null

export function getStackServerApp(): StackServerApp {
  if (!_stackServerApp) {
    _stackServerApp = new StackServerApp({
      projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || 'placeholder',
      publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || 'placeholder',
      secretServerKey: process.env.STACK_SECRET_SERVER_KEY || 'placeholder',
    } as any)
  }
  return _stackServerApp
}

export const stackServerApp = new Proxy({} as StackServerApp, {
  get(target, prop) {
    return getStackServerApp()[prop as keyof StackServerApp]
  }
})


