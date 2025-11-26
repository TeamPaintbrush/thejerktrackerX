# 🚀 Beginner's Guide: Deploy Your Mobile App Backend to AWS

## What You're Doing
You're connecting your mobile app to Amazon Web Services (AWS) so it can:
- ✅ Store user accounts in the cloud
- ✅ Save and retrieve orders
- ✅ Handle authentication
- ✅ Work without a traditional server (serverless = cheaper!)

## What You Need (5 minutes)
1. ✅ **AWS Account** - Sign up at https://aws.amazon.com (free tier available)
2. ✅ **AWS SAM CLI** - Install with: `choco install aws-sam-cli` (or see below)
3. ✅ **AWS Toolkit for VS Code** - You already have this! 👍

---

## Step 1: Install AWS SAM CLI (5 minutes)

### Option A: Using Chocolatey (Easiest)
```powershell
# Install Chocolatey first if you don't have it
# Run this in PowerShell as Administrator:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Then install SAM CLI
choco install aws-sam-cli
```

### Option B: Download Installer
1. Download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
2. Run the installer
3. Restart VS Code

### Verify Installation
```powershell
sam --version
# Should show: SAM CLI, version 1.x.x
```

---

## Step 2: Configure AWS Credentials (10 minutes)

### 2.1 Create AWS Access Keys
1. Log in to AWS Console: https://console.aws.amazon.com/
2. Click your name (top right) → **Security credentials**
3. Scroll to **Access keys** → Click **Create access key**
4. Choose **Command Line Interface (CLI)**
5. Check "I understand" → Click **Next** → **Create access key**
6. **⚠️ IMPORTANT:** Copy both:
   - Access key ID (looks like: `AKIAIOSFODNN7EXAMPLE`)
   - Secret access key (looks like: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

### 2.2 Configure in VS Code
**Method 1: Using AWS Toolkit (Recommended)**
1. Press `Ctrl+Shift+P` in VS Code
2. Type: **AWS: Create Credentials Profile**
3. Enter profile name: `default`
4. Enter Access Key ID (from step 2.1)
5. Enter Secret Access Key (from step 2.1)
6. Enter region: `us-east-1`

**Method 2: Using Command Line**
```powershell
aws configure
# Enter the following when prompted:
# AWS Access Key ID: [paste your key]
# AWS Secret Access Key: [paste your secret]
# Default region name: us-east-1
# Default output format: json
```

---

## Step 3: Deploy Lambda Functions (10 minutes)

### 3.1 Open Terminal in VS Code
- Press `` Ctrl+` `` (backtick key)
- Make sure you're in PowerShell

### 3.2 Navigate to AWS Lambda Folder
```powershell
cd aws-lambda
```

### 3.3 Run Deployment Script
```powershell
.\deploy-to-aws.ps1
```

### 3.4 Answer the Prompts
The script will ask you several questions. Here's what to answer:

```
Stack Name: jerktracker-mobile-api
AWS Region: us-east-1
Confirm changes before deploy: Y
Allow SAM CLI IAM role creation: Y
Allow SAM CLI to create managed default roles: Y
UserSignupFunction may not have authorization defined: Y
UserLoginFunction may not have authorization defined: Y
OrdersHandlerFunction may not have authorization defined: Y
LocationsHandlerFunction may not have authorization defined: Y
Save arguments to configuration file: Y
SAM configuration file: samconfig.toml
SAM configuration environment: default
```

### 3.5 Wait for Deployment (5-10 minutes)
You'll see output like:
```
CloudFormation stack changeset
---------------------------------
Operation    LogicalResourceId    ResourceType
---------------------------------
+ Add        JerkTrackerApi       AWS::ApiGateway::RestApi
+ Add        UserSignupFunction   AWS::Lambda::Function
...
```

### 3.6 **SAVE YOUR API URL!**
At the end, you'll see:
```
Outputs
---------------------------------
Key         ApiUrl
Value       https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/
---------------------------------
```

**⚠️ COPY THIS URL!** You need it for the next step!

---

## Step 4: Configure Your Mobile App (2 minutes)

### 4.1 Create .env.local File
1. In VS Code, open your project root folder
2. Create a new file: `.env.local`
3. Copy the contents from `.env.local.template`
4. **Update this line** with your API URL from Step 3.6:

```env
NEXT_PUBLIC_MOBILE_API_BASE_URL=https://YOUR-API-URL-HERE.execute-api.us-east-1.amazonaws.com/prod
```

**Example:**
```env
NEXT_PUBLIC_MOBILE_API_BASE_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

### 4.2 Save the File
Make sure `.env.local` is NOT committed to Git (it's already in `.gitignore`)!

---

## Step 5: Test Your Integration (5 minutes)

### 5.1 Rebuild Mobile App
```powershell
npm run build:mobile
npx cap sync android
```

### 5.2 Test in Android Studio
1. Open Android Studio: `npx cap open android`
2. Run the app on an emulator or device
3. Try creating an account
4. Try logging in

### 5.3 Check AWS Console for Activity
1. Go to: https://console.aws.amazon.com/lambda/
2. Click on `jerktracker-userSignup`
3. Go to **Monitor** tab → **View CloudWatch logs**
4. You should see logs from your app's requests!

---

## 🎉 You're Done!

Your mobile app is now connected to AWS Lambda! Here's what happens when users interact with your app:

1. User signs up → Mobile app calls Lambda API → Lambda saves to DynamoDB
2. User logs in → Mobile app calls Lambda API → Lambda verifies credentials
3. User creates order → Mobile app calls Lambda API → Lambda saves order

---

## 💰 How Much Will This Cost?

### Free Tier (First 12 Months)
- Lambda: 1,000,000 requests/month FREE
- API Gateway: 1,000,000 requests/month FREE
- DynamoDB: 25GB storage FREE

### After Free Tier
For a small app with 100 users:
- **Estimated cost: $0-2/month**

Most small apps stay within free tier limits!

---

## 🔧 Troubleshooting

### "sam: command not found"
**Solution:** Install AWS SAM CLI (see Step 1)

### "Unable to locate credentials"
**Solution:** Configure AWS credentials (see Step 2)

### "Stack already exists"
**Solution:** This is okay! Run `sam deploy` again without `--guided`

### App shows "Network error"
**Solution:** 
1. Check `.env.local` has correct API URL
2. Make sure URL ends with `/prod` (no trailing slash after)
3. Rebuild app: `npm run build:mobile`

### "CORS error" in mobile app
**Solution:** 
- The SAM template already handles CORS
- Redeploy if you see this: `sam build && sam deploy`

---

## 📚 What Just Happened? (For Learning)

1. **SAM Template (`template.yaml`)**: Describes your infrastructure as code
2. **Lambda Functions**: Run your backend code without managing servers
3. **API Gateway**: Creates REST API endpoints for your mobile app
4. **DynamoDB**: NoSQL database storing your data
5. **IAM Role**: Gives Lambda permission to access DynamoDB

---

## 🎓 Next Steps

1. ✅ Monitor usage in AWS Console
2. ✅ Set up CloudWatch alarms for errors
3. ✅ Add API keys for extra security (see main guide)
4. ✅ Deploy your mobile app to Google Play Store!

---

## 🆘 Need Help?

1. **AWS Toolkit in VS Code:** Press `Ctrl+Shift+P` → "AWS: View Toolkit Documentation"
2. **Amazon Q (AI Assistant):** Press `Ctrl+I` → Ask AWS-specific questions
3. **AWS Console:** https://console.aws.amazon.com/
4. **Your Lambda logs:** https://console.aws.amazon.com/cloudwatch/

---

## 📝 Quick Reference Commands

```powershell
# Deploy functions
cd aws-lambda
.\deploy-to-aws.ps1

# Or manually:
sam build
sam deploy --guided

# Update after code changes
sam build && sam deploy

# View logs in real-time
sam logs -n jerktracker-userSignup --tail

# Delete everything (if needed)
sam delete
```

Good luck! 🚀
