# ⚡ Quick Commands Reference

Copy & paste these commands for common tasks.

## 🚀 Setup & Deployment

```powershell
# Verify setup
.\verify-setup.ps1

# Automated setup (recommended)
.\setup-complete.ps1

# Manual Lambda deployment
cd aws-lambda
.\deploy-to-aws.ps1
cd ..
```

## 🖥️ Web Development

```powershell
# Start dev server (http://localhost:3100)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

## 📱 Mobile Development

```powershell
# Build mobile app
npm run build:mobile

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# Run on device/emulator
npm run android:run

# Full build & deploy
npm run android:build
```

## ☁️ AWS Lambda

```powershell
cd aws-lambda

# Deploy with guided setup
.\deploy-to-aws.ps1

# Manual deployment
sam build
sam deploy

# View logs (real-time)
sam logs -n jerktracker-userSignup --tail

# Delete stack
sam delete

# List functions
aws lambda list-functions --region us-east-1
```

## 🔍 Debugging

```powershell
# Clear Next.js cache
rm -r .next

# Rebuild everything
npm run build

# Check environment
node -v
npm -v
sam --version
aws --version

# View .env.local
type .env.local
```

## 📊 AWS Console Links

- Lambda: https://console.aws.amazon.com/lambda/
- API Gateway: https://console.aws.amazon.com/apigateway/
- DynamoDB: https://console.aws.amazon.com/dynamodb/
- CloudWatch: https://console.aws.amazon.com/cloudwatch/
- IAM: https://console.aws.amazon.com/iam/

## 🔐 Credentials

```powershell
# Configure AWS credentials
aws configure

# Or use AWS Toolkit
# Ctrl+Shift+P → AWS: Create Credentials Profile
```

## 📝 Environment Variables

```powershell
# View .env.local
cat .env.local

# Edit .env.local
code .env.local

# Copy template
Copy-Item .env.local.template .env.local
```

## 🧪 Testing

```powershell
# Test web app
npm run dev
# Visit http://localhost:3100

# Test mobile app
npm run build:mobile
npx cap open android
# Run on emulator/device

# Test Lambda
sam logs -n jerktracker-userSignup --tail
# Make API calls and watch logs
```

## 🎯 Common Tasks

### Deploy Lambda
```powershell
cd aws-lambda && .\deploy-to-aws.ps1
```

### Update Mobile API URL
```powershell
# Edit .env.local
code .env.local
# Update: NEXT_PUBLIC_MOBILE_API_BASE_URL=https://your-api-url/prod
```

### Rebuild Mobile App
```powershell
npm run build:mobile
npx cap sync android
```

### View Lambda Logs
```powershell
cd aws-lambda
sam logs -n jerktracker-userSignup --tail
```

### Check AWS Resources
```powershell
# List Lambda functions
aws lambda list-functions --region us-east-1

# List API Gateways
aws apigateway get-rest-apis --region us-east-1

# List DynamoDB tables
aws dynamodb list-tables --region us-east-1
```

## 💾 Git Commands

```powershell
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Your message"

# Push
git push

# Pull
git pull

# View logs
git log --oneline
```

## 🔗 Useful Links

- Node.js: https://nodejs.org/
- AWS SAM: https://aws.amazon.com/serverless/sam/
- Next.js: https://nextjs.org/
- Capacitor: https://capacitorjs.com/
- AWS Console: https://console.aws.amazon.com/

## 📞 Help

- Amazon Q: `Ctrl+I`
- VS Code Help: `Ctrl+?`
- AWS Docs: https://docs.aws.amazon.com/
- Project Docs: See `docs/` folder

---

**Pro Tip:** Bookmark this file for quick reference! 📌
