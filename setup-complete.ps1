# 🚀 The JERK Tracker - Complete Setup Script
# This script automates the entire deployment checklist

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  The JERK Tracker X - Complete Setup & Deployment         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Phase 1: Prerequisites Check
Write-Host "📋 PHASE 1: Checking Prerequisites..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$prereqsMet = $true

# Check Node.js
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCheck) {
    Write-Host "✅ Node.js installed" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    $prereqsMet = $false
}

# Check npm
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
if ($npmCheck) {
    Write-Host "✅ npm installed" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found" -ForegroundColor Red
    $prereqsMet = $false
}

# Check AWS CLI
$awsCheck = Get-Command aws -ErrorAction SilentlyContinue
if ($awsCheck) {
    Write-Host "✅ AWS CLI installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  AWS CLI not found (optional, but recommended)" -ForegroundColor Yellow
}

# Check SAM CLI
$samCheck = Get-Command sam -ErrorAction SilentlyContinue
if ($samCheck) {
    Write-Host "✅ AWS SAM CLI installed" -ForegroundColor Green
} else {
    Write-Host "❌ AWS SAM CLI not found" -ForegroundColor Red
    Write-Host "   Install with: choco install aws-sam-cli" -ForegroundColor Cyan
    $prereqsMet = $false
}

Write-Host ""

if (-not $prereqsMet) {
    Write-Host "❌ Please install missing prerequisites and try again" -ForegroundColor Red
    exit 1
}

# Phase 2: Install Dependencies
Write-Host "📦 PHASE 2: Installing Dependencies..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$projectRoot = $PSScriptRoot
Set-Location $projectRoot

Write-Host "Installing root dependencies..." -ForegroundColor White
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed" -ForegroundColor Green

Write-Host "Installing Lambda dependencies..." -ForegroundColor White
Set-Location "$projectRoot\aws-lambda"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Lambda dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Lambda dependencies installed" -ForegroundColor Green

Set-Location $projectRoot
Write-Host ""

# Phase 3: Environment Setup
Write-Host "⚙️  PHASE 3: Environment Configuration..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if (Test-Path ".env.local") {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found" -ForegroundColor Yellow
    Write-Host "   Creating from template..." -ForegroundColor White
    Copy-Item ".env.local.template" ".env.local"
    Write-Host "✅ .env.local created" -ForegroundColor Green
    Write-Host "   ⚠️  Update NEXT_PUBLIC_MOBILE_API_BASE_URL after Lambda deployment" -ForegroundColor Cyan
}

Write-Host ""

# Phase 4: Build Check
Write-Host "🔨 PHASE 4: Build Verification..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "Building Next.js app..." -ForegroundColor White
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green

Write-Host ""

# Phase 5: Lambda Deployment
Write-Host "🚀 PHASE 5: Lambda Deployment..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$deployLambda = Read-Host "Deploy Lambda functions now? (Y/n)"
if ($deployLambda -ne "n" -and $deployLambda -ne "N") {
    Set-Location "$projectRoot\aws-lambda"
    Write-Host ""
    Write-Host "Building SAM application..." -ForegroundColor White
    sam build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ SAM build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ SAM build successful" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Starting guided deployment..." -ForegroundColor White
    Write-Host "Suggested values:" -ForegroundColor Cyan
    Write-Host "  Stack name: jerktracker-mobile-api" -ForegroundColor White
    Write-Host "  Region: us-east-1" -ForegroundColor White
    Write-Host "  Confirm changes: Y" -ForegroundColor White
    Write-Host "  Allow IAM role creation: Y" -ForegroundColor White
    Write-Host ""
    
    sam deploy --guided
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Deployment failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "✅ Lambda deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📌 IMPORTANT: Copy the API URL from the output above" -ForegroundColor Cyan
    Write-Host "   It should look like: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/" -ForegroundColor White
    Write-Host ""
    
    $apiUrl = Read-Host "Paste your API URL here"
    if ($apiUrl) {
        Set-Location $projectRoot
        $envContent = Get-Content ".env.local"
        $envContent = $envContent -replace "NEXT_PUBLIC_MOBILE_API_BASE_URL=.*", "NEXT_PUBLIC_MOBILE_API_BASE_URL=$apiUrl"
        Set-Content ".env.local" $envContent
        Write-Host "✅ API URL saved to .env.local" -ForegroundColor Green
    }
} else {
    Write-Host "⏭️  Skipping Lambda deployment" -ForegroundColor Yellow
    Write-Host "   Run manually: cd aws-lambda && .\deploy-to-aws.ps1" -ForegroundColor Cyan
}

Set-Location $projectRoot
Write-Host ""

# Phase 6: Summary
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Setup Complete!                                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "1️⃣  Start development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  Build mobile app:" -ForegroundColor White
Write-Host "   npm run build:mobile" -ForegroundColor Cyan
Write-Host ""
Write-Host "3️⃣  Sync to Android:" -ForegroundColor White
Write-Host "   npx cap sync android" -ForegroundColor Cyan
Write-Host ""
Write-Host "4️⃣  Open in Android Studio:" -ForegroundColor White
Write-Host "   npx cap open android" -ForegroundColor Cyan
Write-Host ""
Write-Host "5️⃣  Monitor Lambda functions:" -ForegroundColor White
Write-Host "   https://console.aws.amazon.com/lambda/" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md - Project overview" -ForegroundColor White
Write-Host "   - docs/QUICK-REFERENCE.md - Quick start guide" -ForegroundColor White
Write-Host "   - aws-lambda/BEGINNER-DEPLOYMENT-GUIDE.md - Detailed deployment steps" -ForegroundColor White
Write-Host ""
