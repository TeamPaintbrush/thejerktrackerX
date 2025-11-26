# AWS Lambda + Mobile App Integration Guide

## 🎯 Overview
This guide connects your mobile app to AWS Lambda backend (serverless, pay-per-use).

**Prerequisites:**
- ✅ AWS Account (free tier available)
- ✅ AWS Toolkit for VS Code (you have this installed!)
- ✅ Lambda functions in `aws-lambda/` folder
- ✅ Mobile app configured for API calls

---

## Step 1: Deploy Lambda Functions via AWS Toolkit (EASIEST METHOD)

### 1.1 Install AWS SAM CLI (Required for AWS Toolkit)
```powershell
# Using Chocolatey (recommended)
choco install aws-sam-cli

# OR download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
```

### 1.2 Configure AWS Credentials in VS Code
1. Press `Ctrl+Shift+P`
2. Type: "AWS: Create Credentials Profile"
3. Enter your AWS credentials:
   - Access Key ID (from AWS IAM)
   - Secret Access Key
   - Region: `us-east-1`

### 1.3 Deploy Functions Using AWS Toolkit
1. Open VS Code Command Palette (`Ctrl+Shift+P`)
2. Type: "AWS: Deploy SAM Application"
3. Follow the prompts (or use the manual method below)

---

## Step 2: Manual Lambda Deployment (Alternative)

### 2.1 Package Functions
```powershell
cd aws-lambda
npm install

# Create deployment packages
New-Item -ItemType Directory -Force -Path ".\deploy"
Compress-Archive -Path "userSignup.js", "node_modules" -DestinationPath ".\deploy\userSignup.zip" -Force
Compress-Archive -Path "userLogin.js", "node_modules" -DestinationPath ".\deploy\userLogin.zip" -Force
Compress-Archive -Path "ordersHandler.js", "node_modules" -DestinationPath ".\deploy\ordersHandler.zip" -Force
Compress-Archive -Path "locationsHandler.js", "node_modules" -DestinationPath ".\deploy\locationsHandler.zip" -Force
```

### 2.2 Create Lambda Functions via AWS Console
1. Go to: https://console.aws.amazon.com/lambda/
2. For each function (userSignup, userLogin, ordersHandler, locationsHandler):
   - Click **Create function**
   - Name: `jerktracker-[function-name]`
   - Runtime: Node.js 20.x
   - Upload ZIP from `deploy/` folder
   - Set execution role: `JerkTrackerLambdaRole` (create if needed - see SETUP-GUIDE.md)

---

## Step 3: Set Up API Gateway (Crucial for Mobile Access)

### 3.1 Create REST API
1. Go to: https://console.aws.amazon.com/apigateway/
2. Click **Create API** → **REST API** → **Build**
3. **API name:** `jerktracker-mobile-api`
4. **Endpoint Type:** Regional
5. Click **Create API**

### 3.2 Create Resources and Methods

#### For User Authentication:

**Resource: /auth**
1. Actions → Create Resource
2. Resource Name: `auth`
3. Click **Create Resource**

**POST /auth/login**
1. Click on `/auth`
2. Actions → Create Method → POST
3. Integration type: Lambda Function
4. Lambda Function: `jerktracker-userLogin`
5. Click **Save** → **OK**

**POST /auth/signup**
1. Click on `/auth`
2. Actions → Create Method → POST
3. Integration type: Lambda Function
4. Lambda Function: `jerktracker-userSignup`
5. Click **Save** → **OK**

#### For Orders:

**Resource: /orders**
1. Actions → Create Resource
2. Resource Name: `orders`
3. Click **Create Resource**

**Methods:**
- GET /orders (list all) → `jerktracker-ordersHandler`
- POST /orders (create) → `jerktracker-ordersHandler`
- GET /orders/{id} → `jerktracker-ordersHandler`
- PUT /orders/{id} → `jerktracker-ordersHandler`
- DELETE /orders/{id} → `jerktracker-ordersHandler`

#### For Locations:

**Resource: /locations**
1. Actions → Create Resource
2. Resource Name: `locations`
3. Click **Create Resource**

**Methods:**
- GET /locations → `jerktracker-locationsHandler`
- POST /locations → `jerktracker-locationsHandler`
- GET /locations/{id} → `jerktracker-locationsHandler`
- PUT /locations/{id} → `jerktracker-locationsHandler`
- DELETE /locations/{id} → `jerktracker-locationsHandler`

### 3.3 Enable CORS (Critical for Mobile!)
For EACH resource (/auth, /orders, /locations):
1. Select the resource
2. Actions → Enable CORS
3. Check all methods
4. Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-mobile-api-key`
5. Click **Enable CORS**

### 3.4 Deploy API
1. Actions → Deploy API
2. Deployment stage: **New Stage**
3. Stage name: `prod`
4. Click **Deploy**

**🎉 Copy your API URL!** It will look like:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

---

## Step 4: Configure Mobile App

### 4.1 Create `.env.local` File
Create this file in your project root:

```env
# Copy from .env.example and add Lambda API URL

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3100

# AWS DynamoDB Configuration (for web version)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_DYNAMODB_TABLE_NAME=jerktracker-orders
NEXT_PUBLIC_DYNAMODB_USERS_TABLE=jerktracker-users
NEXT_PUBLIC_ENABLE_DYNAMODB=true

# 🚀 LAMBDA API URL (ADD THIS!)
NEXT_PUBLIC_MOBILE_API_BASE_URL=https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod

# Optional: API Key for extra security
NEXT_PUBLIC_MOBILE_API_KEY=your-optional-api-key
```

### 4.2 Update API Gateway URLs in Auth Service
The mobile app already has the integration code! Once you set `NEXT_PUBLIC_MOBILE_API_BASE_URL`, it will automatically use:
- `{API_URL}/auth/login` for login
- `{API_URL}/auth/signup` for signup
- `{API_URL}/orders` for orders
- `{API_URL}/locations` for locations

---

## Step 5: Test the Integration

### 5.1 Test Lambda Functions Directly
Use AWS Toolkit in VS Code:
1. Open AWS Explorer (sidebar)
2. Navigate to Lambda → Functions
3. Right-click a function → **Invoke on AWS**
4. Provide test payload:

**Test userLogin:**
```json
{
  "httpMethod": "POST",
  "body": "{\"email\":\"test@example.com\",\"password\":\"testpass123\"}"
}
```

### 5.2 Test via Mobile App
1. Build mobile app:
```powershell
npm run build:mobile
npx cap sync android
```

2. Run in Android Studio
3. Try signing up a new user
4. Check CloudWatch Logs in AWS Console for debugging

### 5.3 Monitor Requests
- **Lambda Console:** View invocations, errors, duration
- **CloudWatch Logs:** See console.log output from functions
- **API Gateway:** Monitor request counts, latency

---

## Step 6: Secure Your API (Production)

### 6.1 Add API Key (Optional)
1. In API Gateway Console
2. API Keys → Create API Key
3. Usage Plans → Create Usage Plan
4. Associate API Key with Usage Plan
5. Add to environment: `NEXT_PUBLIC_MOBILE_API_KEY=your-api-key`

### 6.2 Lambda Environment Variables
Add to each Lambda function:
- `AWS_REGION`: `us-east-1`
- `DYNAMODB_TABLE_ORDERS`: `jerktracker-orders`
- `DYNAMODB_TABLE_USERS`: `jerktracker-users`
- `DYNAMODB_TABLE_LOCATIONS`: `Locations`

---

## 📊 Expected Costs

### Free Tier (First 12 Months)
- Lambda: 1M requests/month FREE
- API Gateway: 1M requests/month FREE
- DynamoDB: 25GB storage + 25 WCU/RCU FREE

### After Free Tier
- Lambda: $0.20 per 1M requests
- API Gateway: $3.50 per 1M requests
- DynamoDB: Pay for actual usage

**Estimated for small app:** $0-5/month

---

## 🔧 Troubleshooting

### Issue: CORS Errors
**Solution:**
- Enable CORS on all API Gateway methods
- Add `x-mobile-api-key` to allowed headers
- Redeploy API after changes

### Issue: 403 Forbidden
**Solution:**
- Check Lambda execution role has DynamoDB permissions
- Verify API Gateway has permission to invoke Lambda
- Check if API key is required but not provided

### Issue: 500 Internal Server Error
**Solution:**
- Check CloudWatch Logs for Lambda errors
- Verify DynamoDB table names match environment variables
- Ensure bcryptjs is included in Lambda deployment package

### Issue: Timeout
**Solution:**
- Increase Lambda timeout (default 3s → 10s)
- Check DynamoDB table exists and is accessible
- Verify internet connectivity from Lambda (VPC issues)

---

## 🎓 Next Steps

1. ✅ Deploy Lambda functions
2. ✅ Set up API Gateway
3. ✅ Configure mobile app with API URL
4. ✅ Test authentication flow
5. ✅ Deploy mobile app to Google Play Store
6. 📈 Monitor usage and costs in AWS Console

---

## 📚 Helpful Resources

- **AWS Lambda Console:** https://console.aws.amazon.com/lambda/
- **API Gateway Console:** https://console.aws.amazon.com/apigateway/
- **CloudWatch Logs:** https://console.aws.amazon.com/cloudwatch/
- **AWS Toolkit Guide:** https://docs.aws.amazon.com/toolkit-for-vscode/
- **Your Lambda Code:** `aws-lambda/` folder in this project

Need help? Check the AWS Toolkit documentation or use Amazon Q in VS Code (`Ctrl+I` → Ask AWS questions)!
