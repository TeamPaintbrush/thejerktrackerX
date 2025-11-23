# Quick Deployment Guide - GitHub Pages for QR Codes

## Step-by-Step Setup

### 1. Create GitHub Repository for Driver Pickup Page

```bash
# Navigate to the driver pickup folder
cd github-pages-driver-pickup

# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit: Driver pickup page"

# Create repository on GitHub
# Go to: https://github.com/new
# Repository name: jerk-tracker-driver-pickup
# Make it PUBLIC
# Don't initialize with README (we already have files)

# Add remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/jerk-tracker-driver-pickup.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository: `https://github.com/YOUR-USERNAME/jerk-tracker-driver-pickup`
2. Click **Settings** → **Pages**
3. Under "Source": Select **Deploy from a branch**
4. Branch: **main** / Folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes for deployment

Your page will be live at:
```
https://YOUR-USERNAME.github.io/jerk-tracker-driver-pickup/
```

### 3. Update Mobile App QR Codes

In your mobile app code, replace `YOUR-USERNAME` with your actual GitHub username:

**File:** `app/mobile/qr/page.tsx`

Find and replace all instances:
```typescript
// Change from:
https://YOUR-USERNAME.github.io/jerk-tracker-driver-pickup/

// To (example):
https://TeamPaintbrush.github.io/jerk-tracker-driver-pickup/
```

### 4. Update API Configuration in GitHub Pages

**File:** `github-pages-driver-pickup/index.html`

Find line with `API_BASE_URL` and update it:

**Option A: Use Vercel/Netlify (Recommended)**
```javascript
const API_BASE_URL = 'https://jerk-tracker-api.vercel.app';
```

**Option B: Use AWS API Gateway**
```javascript
const API_BASE_URL = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod';
```

**Option C: Use your own domain**
```javascript
const API_BASE_URL = 'https://api.jerktrackerx.com';
```

### 5. Deploy Your API (Choose One)

#### Option A: Vercel (Easiest - Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: jerk-tracker-api
# - Directory: ./ (press Enter)
# - Modify settings? No

# Get your URL (example):
# https://jerk-tracker-api.vercel.app

# Update index.html with this URL
```

#### Option B: AWS Lambda + API Gateway

1. Use AWS SAM or Serverless Framework
2. Deploy API routes as Lambda functions
3. Get API Gateway URL
4. Update `index.html` with the URL

#### Option C: Traditional Hosting

1. Deploy Next.js app to any hosting (DigitalOcean, Heroku, etc.)
2. Get your domain
3. Update `index.html` with the URL

### 6. Rebuild and Test

```bash
# Update mobile app QR codes with your GitHub Pages URL
# Then rebuild mobile app
npm run build:mobile

# Sync to Android
npx cap sync android

# Test the flow:
# 1. Open mobile app → QR Manager
# 2. Click "View QR" on an order
# 3. Scan QR code with another phone
# 4. Should open GitHub Pages driver pickup page
# 5. Fill form and submit
# 6. Should call your API and update order
```

### 7. Custom Domain (Optional)

To use your own domain instead of GitHub Pages URL:

1. Buy domain (e.g., `pickup.jerktrackerx.com`)
2. In GitHub repository Settings → Pages → Custom domain
3. Enter your domain: `pickup.jerktrackerx.com`
4. Update DNS records as instructed
5. Enable "Enforce HTTPS"
6. Update QR codes in mobile app with new domain

---

## Quick Reference

**GitHub Pages URL Pattern:**
```
https://YOUR-USERNAME.github.io/REPO-NAME/
```

**QR Code URL Pattern:**
```
https://YOUR-USERNAME.github.io/jerk-tracker-driver-pickup/?order=ORDER_ID
```

**Files to Update:**
1. `app/mobile/qr/page.tsx` - QR code generation (2 locations)
2. `github-pages-driver-pickup/index.html` - API_BASE_URL configuration

---

## Troubleshooting

**QR code doesn't open page:**
- Check GitHub Pages is enabled in repository settings
- Verify URL is correct (https, not http)
- Wait a few minutes after enabling Pages

**API calls fail with CORS error:**
- Verify CORS headers in API routes
- Check API_BASE_URL in index.html matches your deployed API

**Order not found:**
- Verify order exists in DynamoDB
- Check order ID in URL matches database

---

## Next Steps After Deployment

1. Test QR code scanning with real phone
2. Verify order updates in DynamoDB
3. Add restaurant notifications (TODO in pickup route)
4. Consider adding analytics to track pickups
5. Get a custom domain for professional look

