'use client'

export default function DebugPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Debug Page</h1>
      <p>If you can see this, the app is working!</p>
      <h2>Environment Variables Check:</h2>
      <ul>
        <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</li>
      </ul>
      <p>
        <a href="/login">Go to Login</a> | <a href="/dashboard">Go to Dashboard</a>
      </p>
    </div>
  )
}

