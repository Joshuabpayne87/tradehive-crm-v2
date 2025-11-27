// Minimal test page - no imports, no dependencies
export default function MinimalPage() {
  return (
    <html>
      <body style={{ padding: '2rem', fontFamily: 'Arial' }}>
        <h1>Minimal Test Page</h1>
        <p>If you see this, Next.js is working!</p>
        <p>Time: {new Date().toISOString()}</p>
      </body>
    </html>
  )
}

