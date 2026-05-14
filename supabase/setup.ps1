# Supabase ERP Setup Script
# Run this from the project root in PowerShell after installing the Supabase CLI.
# This script does not contain credentials. Set your environment variables before running.

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
  Write-Host "Supabase CLI is not installed. Install with: npm install -g supabase" -ForegroundColor Yellow
  return
}

if (-not $env:SUPABASE_URL -or -not $env:SUPABASE_ANON_KEY) {
  Write-Host "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment or .env.local before running." -ForegroundColor Yellow
  return
}

Write-Host "Running SQL schema setup for the ERP..." -ForegroundColor Green

# Use the SQL file in the supabase folder to create tables and seed the ERP schema
supabase db execute --file ./supabase/create_bookings_table.sql

if ($LASTEXITCODE -ne 0) {
  Write-Host "Supabase CLI failed to execute the schema file. Please verify your Supabase project is linked and your credentials are correct." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "ERP schema setup complete. Verify tables in Supabase Studio or run npm run build." -ForegroundColor Green
