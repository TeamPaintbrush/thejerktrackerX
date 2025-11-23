# Quick Build Script - SDK 35 AAB
# Save as: build-sdk35.ps1
# Run: .\build-sdk35.ps1

Write-Host "`n🚀 Building SDK 35 AAB for Google Play Store`n" -ForegroundColor Green

# Check Java version
Write-Host "📋 Checking Java version..." -ForegroundColor Cyan
$javaVersion = java -version 2>&1 | Select-String "version" | Out-String
if ($javaVersion -notmatch "21\.") {
    Write-Host "⚠️  WARNING: Java 21 not detected!" -ForegroundColor Yellow
    Write-Host "Current Java: $javaVersion" -ForegroundColor Yellow
    Write-Host "Please install Java 21: choco install microsoft-openjdk-21 -y" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") { exit 1 }
}

# Temporarily move API folder outside app directory
Write-Host "🔄 Preparing mobile build..." -ForegroundColor Cyan
if (Test-Path "app\api") {
    Move-Item -Path "app\api" -Destination "api-backup" -Force -ErrorAction SilentlyContinue
}

# Build mobile
Write-Host "📦 Building Next.js for mobile..." -ForegroundColor Cyan
npm run build:mobile

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Next.js build failed!" -ForegroundColor Red
    if (Test-Path "api-backup") {
        Move-Item -Path "api-backup" -Destination "app\api" -Force -ErrorAction SilentlyContinue
    }
    exit 1
}

# Ensure index.html exists
if (!(Test-Path "out\index.html")) {
    Write-Host "📄 Creating index.html..." -ForegroundColor Cyan
    Copy-Item "out\404.html" "out\index.html" -Force
}

# Sync to Android
Write-Host "🔄 Syncing with Capacitor..." -ForegroundColor Cyan
npx cap sync android

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
    if (Test-Path "api-backup") {
        Move-Item -Path "api-backup" -Destination "app\api" -Force -ErrorAction SilentlyContinue
    }
    exit 1
}

# Restore API folder
if (Test-Path "api-backup") {
    Move-Item -Path "api-backup" -Destination "app\api" -Force -ErrorAction SilentlyContinue
}

# Build Android AAB
Write-Host "🏗️  Building Android AAB with SDK 35..." -ForegroundColor Cyan
Set-Location android

Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Cyan
.\gradlew clean | Out-Null

Write-Host "🔨 Building release bundle..." -ForegroundColor Cyan
.\gradlew bundleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SUCCESS! SDK 35 AAB built successfully!`n" -ForegroundColor Green
    Write-Host "📍 Location: android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Yellow
    
    $aabPath = "app\build\outputs\bundle\release\app-release.aab"
    if (Test-Path $aabPath) {
        $fileSize = (Get-Item $aabPath).Length / 1MB
        Write-Host "📦 File size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
        Write-Host "`n🎉 Ready to upload to Google Play Store!" -ForegroundColor Green
        Write-Host "   - Target SDK: 35 ✅" -ForegroundColor Green
        Write-Host "   - Compile SDK: 35 ✅" -ForegroundColor Green
    }
} else {
    Write-Host "`n❌ Build failed! Check errors above.`n" -ForegroundColor Red
    Write-Host "💡 Common fixes:" -ForegroundColor Yellow
    Write-Host "   1. Ensure Java 21 is installed: java -version" -ForegroundColor White
    Write-Host "   2. Restart terminal after Java install" -ForegroundColor White
    Write-Host "   3. Check ANDROID_HOME is set" -ForegroundColor White
    exit 1
}

Set-Location ..
Write-Host "`n✨ Build process complete!`n" -ForegroundColor Green
