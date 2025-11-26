# AWS Lambda + API Gateway Setup Guide

## Overview
This guide sets up a complete serverless backend for The JERK Tracker mobile app using AWS Lambda and API Gateway.

**Cost:** $0/month (within free tier limits)
**Time:** 30-45 minutes

---

## Part 1: Prepare Lambda Functions (5 minutes)

### 1.1 Install dependencies
```powershell
cd aws-lambda
npm install
```

### 1.2 Create deployment packages
For each Lambda function, we need to create a ZIP file with code + dependencies.

```powershell
# Create a temp directory for packaging
New-Item -ItemType Directory -Force -Path ".\deploy"

# Package userSignup
Compress-Archive -Path "userSignup.js", "node_modules" -DestinationPath ".\deploy\userSignup.zip" -Force

# Package userLogin  
Compress-Archive -Path "userLogin.js", "node_modules" -DestinationPath ".\deploy\userLogin.zip" -Force

# Package ordersHandler
Compress-Archive -Path "ordersHandler.js", "node_modules" -DestinationPath ".\deploy\ordersHandler.zip" -Force

# Package locationsHandler
Compress-Archive -Path "locationsHandler.js", "node_modules" -DestinationPath ".\deploy\locationsHandler.zip" -Force
```

You should now have 4 ZIP files in `aws-lambda/deploy/`.

---

## Part 2: Create IAM Role for Lambda (5 minutes)

### 2.1 Go to IAM Console
1. Open AWS Console: https://console.aws.amazon.com/iam/
2. Click **Roles** in left sidebar
3. Click **Create role**

### 2.2 Configure Role
- **Trusted entity type:** AWS service
- **Use case:** Lambda
- Click **Next**

### 2.3 Attach Policies
Search and attach these 2 policies:
- ✅ `AWSLambdaBasicExecutionRole` (for CloudWatch logs)
- ✅ `AmazonDynamoDBFullAccess` (for database access)

Click **Next**

### 2.4 Name the Role
- **Role name:** `JerkTrackerLambdaRole`
- Click **Create role**

**✅ Save this role name** - you'll use it when creating Lambda functions.

---

## Part 3: Create Lambda Functions (15 minutes)

For each of the 4 functions, follow these steps:

### 3.1 Go to Lambda Console
https://console.aws.amazon.com/lambda/

### 3.2 Create Function #1: userSignup
1. Click **Create function**
2. Choose **Author from scratch**
3. **Function name:** `userSignup`
4. **Runtime:** Node.js 20.x
5. **Architecture:** x86_64
6. **Execution role:** Use an existing role → Select `JerkTrackerLambdaRole`
7. Click **Create function**

### 3.3 Upload Code
1. In the Code tab, click **Upload from** → **.zip file**
2. Upload `aws-lambda/deploy/userSignup.zip`
3. Click **Save**

### 3.4 Configure Environment
1. Go to **Configuration** tab → **Environment variables**
2. Click **Edit** → **Add environment variable**
   - Key: `AWS_REGION`
   - Value: `us-east-1`
3. Click **Save**

### 3.5 Repeat for Other Functions
Create these 3 more functions with the same steps:

| Function Name | ZIP File | Handler |
|--------------|----------|---------|
| userLogin | userLogin.zip | userLogin.handler |
| ordersHandler | ordersHandler.zip | ordersHandler.handler |
| locationsHandler | locationsHandler.zip | locationsHandler.handler |

---

## Part 4: Create API Gateway (10 minutes)

### 4.1 Go to API Gateway Console
https://console.aws.amazon.com/apigateway/

### 4.2 Create REST API
1. Click **Create API**
2. Choose **REST API** (not HTTP API or REST API Private)
3. Click **Build**
4. **API name:** `JerkTrackerAPI`
5. **Endpoint Type:** Regional
6. Click **Create API**

### 4.3 Create Resources and Methods

#### Resource: /signup
1. Click **Actions** → **Create Resource**
2. **Resource Name:** `signup`
3. **Resource Path:** `/signup`
4. ✅ Check **Enable API Gateway CORS**
5. Click **Create Resource**
6. With `/signup` selected, click **Actions** → **Create Method** → **POST**
7. **Integration type:** Lambda Function
8. **Lambda Function:** `userSignup`
9. Click **Save** → **OK**

#### Resource: /login
Repeat the above steps for:
- Resource Name: `login`
- Method: **POST**
- Lambda Function: `userLogin`

#### Resource: /orders
1. Create resource `/orders`
2. Create methods:
   - **GET** → `ordersHandler`
   - **POST** → `ordersHandler`
3. Create sub-resource `/orders/{id}`
   - Click `/orders` → **Actions** → **Create Resource**
   - Resource Name: `{id}`
   - Resource Path: `{id}`
   - Enable CORS
4. Add methods to `/orders/{id}`:
   - **GET** → `ordersHandler`
   - **PUT** → `ordersHandler`
   - **DELETE** → `ordersHandler`

#### Resource: /locations
Repeat the same pattern as `/orders`:
- `/locations` with GET and POST
- `/locations/{id}` with GET, PUT, DELETE
- All pointing to `locationsHandler`

### 4.4 Enable CORS for All Resources
1. Select each resource (signup, login, orders, orders/{id}, locations, locations/{id})
2. Click **Actions** → **Enable CORS**
3. Leave defaults
4. Click **Enable CORS and replace existing CORS headers**

### 4.5 Deploy API
1. Click **Actions** → **Deploy API**
2. **Deployment stage:** [New Stage]
3. **Stage name:** `prod`
4. Click **Deploy**

### 4.6 Get Your API URL
After deployment, you'll see:
**Invoke URL:** `https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod`

**✅ SAVE THIS URL** - you'll use it in the mobile app!

---

## Part 5: Update Mobile App (5 minutes)

### 5.1 Update Environment Variable
Edit `.env.local` and change:
```env
NEXT_PUBLIC_MOBILE_API_BASE_URL=https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod
```
Replace `XXXXXXXXXX` with your actual API Gateway ID.

### 5.2 Update Mobile Auth Service
The code in `mobileAuth.ts` already uses `NEXT_PUBLIC_MOBILE_API_BASE_URL`, so it will automatically use the new AWS endpoints:
- `/api/mobile-auth/signup/` → `/signup`
- `/api/mobile-auth/login/` → `/login`

Just update the paths:

```typescript
// In mobile-android/shared/services/mobileAuth.ts
const signupUrl = API_BASE_URL ? `${API_BASE_URL}/signup` : '/signup';
const loginUrl = API_BASE_URL ? `${API_BASE_URL}/login` : '/login';
```

### 5.3 Update Mobile Data Service
```typescript
// In mobile-android/shared/services/mobileDataService.ts
// Change all /api/orders to /orders
// Change all /api/locations to /locations
```

---

## Part 6: Test the Setup (5 minutes)

### 6.1 Test Signup
```powershell
curl -X POST "https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/signup" `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","password":"test123456","name":"Test User","role":"customer"}'
```

Expected response: `201 Created` with user data

### 6.2 Test Login
```powershell
curl -X POST "https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","password":"test123456"}'
```

Expected response: `200 OK` with user data

### 6.3 Verify in DynamoDB
1. Go to DynamoDB Console
2. Open `jerktracker-users` table
3. Click **Explore table items**
4. You should see your test user!

---

## Part 7: Build and Deploy Mobile App

```powershell
# Build mobile app with new AWS endpoints
npm run build:mobile
npx cap sync android

# Open in Android Studio and test
npx cap open android
```

---

## Troubleshooting

### Lambda function returns 500 error
- Check CloudWatch Logs: Lambda Console → Your Function → Monitor → View logs in CloudWatch
- Common issue: Missing IAM permissions for DynamoDB

### CORS errors
- Make sure you enabled CORS on ALL resources and methods
- Redeploy the API after enabling CORS

### Can't find EmailIndex
- The `jerktracker-users` table needs a GSI named `EmailIndex`
- DynamoDB Console → jerktracker-users → Indexes tab → Create index
  - Partition key: `email`
  - Index name: `EmailIndex`

---

## Cost Breakdown

**Monthly costs (typical usage):**
- Lambda: $0 (free tier: 1M requests)
- API Gateway: $0 (free tier: 1M requests)
- DynamoDB: $0 (free tier: 25GB + read/write capacity)

**Total: $0/month** for apps with <100K users

---

## What's Next?

After setup is complete:
1. ✅ Mobile app talks directly to AWS (no Vercel dependency for user data)
2. ✅ Vercel ONLY hosts QR code scanning pages
3. ✅ All user/order/location data stored in DynamoDB
4. ✅ Completely serverless, scalable architecture

**Questions?** Check CloudWatch Logs for any errors.
