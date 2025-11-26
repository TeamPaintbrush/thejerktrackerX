# 🎯 AWS Lambda Deployment Checklist

Use this checklist to track your progress deploying The JERK Tracker backend to AWS.

---

## Phase 1: Prerequisites ✅

- [x] AWS Account created (https://aws.amazon.com)
- [x] AWS SAM CLI installed (`choco install aws-sam-cli`)
- [x] AWS credentials configured in VS Code
- [x] AWS Toolkit for VS Code installed (you have this!)

**Time:** 15 minutes  
**Guide:** See `BEGINNER-DEPLOYMENT-GUIDE.md` Steps 1-2

---

## Phase 2: Deploy Lambda Functions ✅

- [x] Navigate to `aws-lambda` folder in terminal
- [x] Run: `.\deploy-to-aws.ps1` (or use `setup-complete.ps1` from root)
- [x] Answer all deployment prompts
- [x] Wait for deployment to complete (5-10 min)
- [x] **SAVE API URL from output!**

**Automated Option:** From project root, run `setup-complete.ps1` to automate all phases

**API URL:** `https://rqbyr7htb1.execute-api.us-east-1.amazonaws.com/prod/`

**Time:** 10-15 minutes  
**Guide:** See `BEGINNER-DEPLOYMENT-GUIDE.md` Step 3

---

## Phase 3: Configure Mobile App ✅

- [x] Create `.env.local` file in project root
- [x] Copy contents from `.env.local.template`
- [x] Paste your API URL into `NEXT_PUBLIC_MOBILE_API_BASE_URL` (from Phase 2)
- [x] Save the file

**Time:** 2 minutes  
**Guide:** See `BEGINNER-DEPLOYMENT-GUIDE.md` Step 4

---

## Phase 4: Test Integration ✅

- [ ] Rebuild mobile app: `npm run build:mobile`
- [ ] Sync to Android: `npx cap sync android`
- [ ] Open in Android Studio: `npx cap open android`
- [ ] Test sign up flow
- [ ] Test login flow
- [ ] Test creating an order
- [ ] Check AWS CloudWatch logs for activity

**Time:** 10 minutes  
**Guide:** See `BEGINNER-DEPLOYMENT-GUIDE.md` Step 5

---

## Phase 5: Verify in AWS Console 🔍

- [ ] Visit Lambda console: https://console.aws.amazon.com/lambda/
- [ ] Check all 4 functions exist:
  - [ ] jerktracker-userSignup
  - [ ] jerktracker-userLogin
  - [ ] jerktracker-ordersHandler
  - [ ] jerktracker-locationsHandler
- [ ] Visit API Gateway console: https://console.aws.amazon.com/apigateway/
- [ ] Check `jerktracker-mobile-api` exists
- [ ] Check CloudWatch logs show recent activity

**Time:** 5 minutes

---

## Phase 6: Production Readiness (Optional) 🔒

- [ ] Add API key for security (see `LAMBDA-MOBILE-INTEGRATION.md`)
- [ ] Set up CloudWatch alarms for errors
- [ ] Configure Lambda reserved concurrency
- [ ] Add custom domain name (optional)
- [ ] Set up AWS WAF for DDoS protection (optional)

**Time:** 30-60 minutes  
**Guide:** See `LAMBDA-MOBILE-INTEGRATION.md` Step 6

---

## 🎉 Completion Checklist

- [ ] Mobile app can sign up new users
- [ ] Mobile app can log in existing users
- [ ] Mobile app can create orders
- [ ] Mobile app can fetch orders
- [ ] AWS Lambda functions show in console
- [ ] CloudWatch logs show request activity
- [ ] No CORS errors in mobile app
- [ ] API URL saved in `.env.local`

---

## 📊 Expected Results

After completing this checklist:

✅ **4 Lambda functions** deployed to AWS  
✅ **1 API Gateway** with REST endpoints  
✅ **Mobile app** connected to Lambda backend  
✅ **DynamoDB** storing user and order data  
✅ **CloudWatch** logging all requests  

**Total time:** 45-60 minutes  
**Monthly cost:** $0 (free tier) to $2/month

---

## 🆘 Stuck? Check These

**Issue:** Can't install SAM CLI  
**Solution:** See `BEGINNER-DEPLOYMENT-GUIDE.md` Step 1

**Issue:** Deployment fails  
**Solution:** Check AWS credentials are configured correctly

**Issue:** Mobile app shows network error  
**Solution:** Verify API URL in `.env.local` is correct

**Issue:** CORS errors  
**Solution:** Redeploy with `sam build && sam deploy`

**Full troubleshooting:** See `BEGINNER-DEPLOYMENT-GUIDE.md` Troubleshooting section

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `BEGINNER-DEPLOYMENT-GUIDE.md` | **START HERE** - Step-by-step for beginners |
| `LAMBDA-MOBILE-INTEGRATION.md` | Complete integration reference |
| `template.yaml` | AWS SAM infrastructure definition |
| `deploy-to-aws.ps1` | Automated deployment script |
| `.env.local.template` | Environment variables template |
| This file | Progress tracking checklist |

---

**Current Status:** [x] Prerequisites Complete  [x] Lambda Deployed  [x] Mobile Configured  [ ] Testing  [ ] Verification

**API URL:** https://rqbyr7htb1.execute-api.us-east-1.amazonaws.com/prod/

**Deployment Date:** 2025-11-23

**Setup Script:** Run `setup-complete.ps1` to automate all phases

**Notes:**
✅ Lambda functions deployed successfully!
✅ API Gateway created with CORS enabled
✅ .env.local updated with API URL
✅ Ready for mobile app testing
- All prerequisites verified and installed
- Dependencies installed for root and Lambda
- Environment configured with .env.local
