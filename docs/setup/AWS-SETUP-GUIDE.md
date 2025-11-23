# AWS DynamoDB Integration Setup Guide

## 🚀 Quick Start (Recommended for GitHub Pages)

For the easiest setup with GitHub Pages, you can use **AWS Cognito Identity Pool** for unauthenticated access:

### 1. Create AWS Cognito Identity Pool
```bash
# Using AWS CLI
aws cognito-identity create-identity-pool \
    --identity-pool-name "JerkTrackerIdentityPool" \
    --allow-unauthenticated-identities \
    --region us-east-1
```

### 2. Set IAM Role Permissions
The unauthenticated role needs DynamoDB permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:Scan",
                "dynamodb:Query"
            ],
            "Resource": "arn:aws:dynamodb:us-east-1:*:table/jerktracker-orders*"
        }
    ]
}
```

### 3. Update Environment Variables
```bash
# Add to .env.local
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 🔧 Alternative Setup (Local Development)

For local development with full AWS credentials:

### 1. Create DynamoDB Table
```bash
# Run the provided script
bash ./aws-setup/create-dynamodb-table.sh
```

### 2. Configure AWS Credentials
```bash
# Option 1: AWS CLI
aws configure

# Option 2: Environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### 3. Update Environment Variables
```bash
# .env.local
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_DYNAMODB_TABLE_NAME=jerktracker-orders
NEXT_PUBLIC_ENABLE_DYNAMODB=true
NEXT_PUBLIC_FALLBACK_MODE=false
```

## 🎯 GitHub Pages Deployment

### Environment Variables for GitHub Actions
Add these secrets to your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add these repository secrets:
   - `NEXT_PUBLIC_AWS_REGION`: us-east-1
   - `NEXT_PUBLIC_DYNAMODB_TABLE_NAME`: jerktracker-orders
   - `NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID`: your-identity-pool-id
   - `NEXT_PUBLIC_ENABLE_DYNAMODB`: true
   - `NEXT_PUBLIC_FALLBACK_MODE`: false

### GitHub Actions Workflow
Update `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Set environment variables
        run: |
          echo "NEXT_PUBLIC_AWS_REGION=${{ secrets.NEXT_PUBLIC_AWS_REGION }}" >> .env.local
          echo "NEXT_PUBLIC_DYNAMODB_TABLE_NAME=${{ secrets.NEXT_PUBLIC_DYNAMODB_TABLE_NAME }}" >> .env.local
          echo "NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=${{ secrets.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID }}" >> .env.local
          echo "NEXT_PUBLIC_ENABLE_DYNAMODB=${{ secrets.NEXT_PUBLIC_ENABLE_DYNAMODB }}" >> .env.local
          echo "NEXT_PUBLIC_FALLBACK_MODE=${{ secrets.NEXT_PUBLIC_FALLBACK_MODE }}" >> .env.local
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        run: npm run deploy
```

## 🧪 Testing

1. **Local Testing**: 
   ```bash
   npm run dev
   # Visit http://localhost:3000/qr-test
   ```

2. **GitHub Pages Testing**:
   ```bash
   npm run deploy
   # Visit https://your-username.github.io/thejerktrackerX/qr-test
   ```

## 🔄 Fallback Behavior

The system automatically falls back in this order:
1. **AWS DynamoDB** (primary)
2. **localStorage** (fallback)
3. **sessionStorage** (fallback)
4. **In-memory storage** (last resort)

## 📊 Cost Estimation

DynamoDB pricing (us-east-1):
- **On-demand**: $1.25 per million write requests, $0.25 per million read requests
- **Provisioned**: 5 RCU + 5 WCU = ~$2.50/month
- **Storage**: $0.25 per GB per month

For a small restaurant: **~$3-5/month**

## 🛡️ Security Best Practices

1. Use Cognito Identity Pool for browser access
2. Restrict IAM permissions to specific table ARNs
3. Enable DynamoDB point-in-time recovery
4. Use HTTPS only (GitHub Pages provides this)
5. Regularly rotate AWS credentials

## 🚨 Troubleshooting

### Common Issues:

1. **"Access Denied"**: Check IAM permissions
2. **"Table not found"**: Verify table name and region
3. **CORS errors**: Use Cognito Identity Pool, not direct credentials
4. **Fallback mode active**: Check environment variables and AWS setup

### Debug Mode:
Set `NEXT_PUBLIC_FALLBACK_MODE=true` to test localStorage fallback.