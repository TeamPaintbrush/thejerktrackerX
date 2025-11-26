# Setup Verification Script
# Checks all prerequisites and configuration

Write-Host "Verifying The JERK Tracker Setup..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor White
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    $nodeVersion = node --version
    Write-Host "OK Node.js $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "FAIL Node.js not installed" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor White
$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($npm) {
    $npmVersion = npm --version
    Write-Host "OK npm $npmVersion" -ForegroundColor Green
} else {
    Write-Host "FAIL npm not installed" -ForegroundColor Red
    $allGood = $false
}

# Check SAM CLI
Write-Host "Checking AWS SAM CLI..." -ForegroundColor White
$sam = Get-Command sam -ErrorAction SilentlyContinue
if ($sam) {
    Write-Host "OK AWS SAM CLI installed" -ForegroundColor Green
} else {
    Write-Host "FAIL AWS SAM CLI not installed" -ForegroundColor Red
    $allGood = $false
}

# Check AWS CLI
Write-Host "Checking AWS CLI..." -ForegroundColor White
$aws = Get-Command aws -ErrorAction SilentlyContinue
if ($aws) {
    Write-Host "OK AWS CLI installed" -ForegroundColor Green
} else {
    Write-Host "WARN AWS CLI not installed (optional)" -ForegroundColor Yellow
}

# Check .env.local
Write-Host "Checking .env.local..." -ForegroundColor White
if (Test-Path ".env.local") {
    Write-Host "OK .env.local exists" -ForegroundColor Green
} else {
    Write-Host "FAIL .env.local not found" -ForegroundColor Red
    $allGood = $false
}

# Check node_modules
Write-Host "Checking dependencies..." -ForegroundColor White
if (Test-Path "node_modules") {
    Write-Host "OK Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "FAIL Root dependencies not installed" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "aws-lambda\node_modules") {
    Write-Host "OK Lambda dependencies installed" -ForegroundColor Green
} else {
    Write-Host "FAIL Lambda dependencies not installed" -ForegroundColor Red
    $allGood = $false
}

# Check key files
Write-Host "Checking key files..." -ForegroundColor White
$keyFiles = @(
    "package.json",
    "next.config.js",
    "tsconfig.json",
    "aws-lambda\template.yaml",
    "aws-lambda\deploy-to-aws.ps1"
)

foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "OK $file" -ForegroundColor Green
    } else {
        Write-Host "FAIL $file missing" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
if ($allGood) {
    Write-Host "All checks passed! Ready to deploy." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next: Run setup-complete.ps1" -ForegroundColor Cyan
} else {
    Write-Host "Some checks failed. Please fix the issues above." -ForegroundColor Red
}
