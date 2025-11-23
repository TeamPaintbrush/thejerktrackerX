# Mobile build script - handles API folder exclusion
Write-Host "🍗 Building JERK Tracker X for Mobile..." -ForegroundColor Green

# Step 1: Clean previous build
if (Test-Path ".next") {
    Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
    Remove-Item -Path ".next" -Recurse -Force
}
if (Test-Path "out") {
    Write-Host "🧹 Cleaning output folder..." -ForegroundColor Yellow
    Remove-Item -Path "out" -Recurse -Force
}

# Step 2: Temporarily move API folder outside app directory
if (Test-Path "app\api") {
    Write-Host "📁 Temporarily moving API routes out of app folder..." -ForegroundColor Yellow
    Move-Item -Path "app\api" -Destination "api.backup" -Force
}

# Step 3: Build the mobile app
Write-Host "🔨 Building Next.js static export..." -ForegroundColor Cyan
$env:BUILD_TARGET = "mobile"
npm run build

# Step 4: Restore API folder
if (Test-Path "api.backup") {
    Write-Host "📁 Restoring API routes..." -ForegroundColor Yellow
    Move-Item -Path "api.backup" -Destination "app\api" -Force
}

if (Test-Path "out\index.html") {
    Write-Host "✅ Mobile build complete! index.html created." -ForegroundColor Green
} else {
    Write-Host "❌ Build failed - no index.html generated" -ForegroundColor Red
}
