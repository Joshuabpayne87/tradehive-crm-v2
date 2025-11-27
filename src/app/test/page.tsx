export default function TestPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Test Page - App is Working!</h1>
      <p>If you can see this, Next.js is running correctly.</p>
      <p>Time: {new Date().toLocaleString()}</p>
      <a href="/login">Go to Login</a>
    </div>
  )
}
