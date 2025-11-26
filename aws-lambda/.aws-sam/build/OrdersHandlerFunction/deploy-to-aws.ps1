# 🚀 Quick Deploy to AWS Lambda using AWS Toolkit
# This script deploys your Lambda functions using AWS SAM (Serverless Application Model)

Write-Host "🎯 The JERK Tracker - Lambda Deployment Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if SAM CLI is installed
Write-Host "✅ Checking for AWS SAM CLI..." -ForegroundColor Yellow
$samInstalled = Get-Command sam -ErrorAction SilentlyContinue

if (-not $samInstalled) {
    Write-Host "❌ AWS SAM CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install AWS SAM CLI first:" -ForegroundColor Yellow
    Write-Host "  choco install aws-sam-cli" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "OR download from:" -ForegroundColor Yellow
    Write-Host "  https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✅ SAM CLI found!" -ForegroundColor Green
Write-Host ""

# Navigate to aws-lambda directory
Set-Location $PSScriptRoot

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed!" -ForegroundColor Green
Write-Host ""

# Build the SAM application
Write-Host "🔨 Building SAM application..." -ForegroundColor Yellow
sam build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed!" -ForegroundColor Green
Write-Host ""

# Deploy the application
Write-Host "🚀 Deploying to AWS..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  You will be prompted for:" -ForegroundColor Cyan
Write-Host "   - Stack name (suggested: jerktracker-mobile-api)" -ForegroundColor White
Write-Host "   - AWS Region (suggested: us-east-1)" -ForegroundColor White
Write-Host "   - Confirm changes before deploy (Y)" -ForegroundColor White
Write-Host "   - Allow SAM CLI IAM role creation (Y)" -ForegroundColor White
Write-Host ""

sam deploy --guided

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy the API URL from the output above" -ForegroundColor White
Write-Host "2. Add it to your .env.local file as NEXT_PUBLIC_MOBILE_API_BASE_URL" -ForegroundColor White
Write-Host "3. Test your mobile app!" -ForegroundColor White
Write-Host ""
Write-Host "📊 Monitor your functions at:" -ForegroundColor Cyan
Write-Host "   https://console.aws.amazon.com/lambda/" -ForegroundColor White
Write-Host ""
