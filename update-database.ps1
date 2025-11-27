# Helper script to update DATABASE_URL and run migrations
param(
    [Parameter(Mandatory=$true)]
    [string]$ConnectionString
)

$envFile = ".env.local"

# Read current .env.local
$content = Get-Content $envFile -Raw

# Replace DATABASE_URL
$newContent = $content -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$ConnectionString`""

# Write back
Set-Content -Path $envFile -Value $newContent -NoNewline

Write-Host "✅ Updated .env.local with new DATABASE_URL" -ForegroundColor Green

# Run migrations
Write-Host "`n🔄 Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init

Write-Host "`n✅ Setup complete! Now run: npm run dev" -ForegroundColor Green



