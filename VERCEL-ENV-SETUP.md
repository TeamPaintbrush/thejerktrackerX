## ✅ Vercel Environment Variables Checklist

Your app requires these environment variables to be set in Vercel:

### 🔧 Required Variables

Go to: **https://vercel.com/teamPaintbrush/thejerktrackerx/settings/environment-variables**

| Variable Name | Value | Environment | Notes |
|--------------|-------|-------------|-------|
| `AWS_REGION` | `us-east-1` | Production, Preview, Development | DynamoDB region |
| `AWS_ACCESS_KEY_ID` | `AKIAZKNH...` | Production, Preview, Development | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | `eoDWK44Q...` | Production, Preview, Development | AWS secret (keep secure!) |
| `NEXT_PUBLIC_MOBILE_API_BASE_URL` | `https://thejerktracker0.vercel.app` | Production, Preview, Development | Mobile app API base URL |
| `MOBILE_LOCATION_ADMIN_KEY` | `mobile-a...` | Production, Preview, Development | Admin key for location endpoints |

### 📋 Steps to Add/Update Variables:

1. Go to Vercel Dashboard: https://vercel.com
2. Select project: **thejerktrackerx**
3. Click **Settings** → **Environment Variables**
4. For each variable above:
   - Click **Add New**
   - Enter **Name** and **Value**
   - Select environments: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

### 🔄 After Adding Variables:

1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache** = OFF
5. Click **Redeploy**

### 🧪 Test Endpoints After Redeployment:

```bash
# Test signup
node scripts/test-auth-api.js

# Check users in DynamoDB
node scripts/list-users.js
```

### ⚠️ Common Issues:

1. **308 Redirect Errors**: Variables not set in Vercel → Redeploy after adding
2. **"Requested resource not found"**: DynamoDB table doesn't exist → Already created ✅
3. **"Invalid credentials"**: AWS keys not set in Vercel → Add variables above

### 📊 Current Status:

- ✅ Local `.env.local` configured correctly
- ✅ `jerktracker-users` table created in DynamoDB
- ✅ API endpoints deployed (`/api/auth/signup`, `/api/auth/login`)
- ⚠️ Vercel environment variables need verification
- ⚠️ Test creating account after verifying Vercel vars
