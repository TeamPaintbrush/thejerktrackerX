# Authentication System Blueprint
## AWS Lambda + DynamoDB + SES Authentication

> **Complete guide for implementing user authentication in Next.js applications with AWS Lambda backend**

---

## 📋 Overview

This blueprint provides a production-ready authentication system with:
- ✅ User sign-up with email verification
- ✅ User sign-in with credentials
- ✅ Password reset (forgot password)
- ✅ Welcome emails via AWS SES
- ✅ DynamoDB for user storage
- ✅ AWS Lambda for serverless API
- ✅ NextAuth.js for web sessions (optional)
- ✅ Cross-platform support (web + mobile)

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Next.js)      │
│  - Sign Up Form │
│  - Sign In Form │
│  - Reset Form   │
└────────┬────────┘
         │
         ├─ Web: NextAuth.js (session-based)
         └─ Mobile: localStorage (token-based)
         │
         ▼
┌─────────────────┐
│  AWS Lambda     │
│  (Node.js 20.x) │
│  - userSignup   │
│  - userLogin    │
│  - resetPassword│
└────────┬────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  DynamoDB    │ │   AWS SES    │ │ bcrypt.js    │
│  Users Table │ │ Email Sender │ │ Hash Passwords│
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 📦 Required AWS Services

### 1. **DynamoDB Table: `Users`**

**Table Schema:**
```
Table Name: Users
Partition Key: id (String)
Global Secondary Index: EmailIndex
  - Partition Key: email (String)
```

**User Object Structure:**
```json
{
  "id": "uuid-v4-generated",
  "email": "user@example.com",
  "password": "bcrypt-hashed-password",
  "name": "John Doe",
  "role": "customer",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "lastLoginPlatform": "web",
  "resetToken": "optional-reset-token",
  "resetTokenExpiry": "optional-timestamp"
}
```

**IAM Permissions Required:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/Users",
        "arn:aws:dynamodb:us-east-1:*:table/Users/index/EmailIndex"
      ]
    }
  ]
}
```

---

### 2. **AWS SES (Simple Email Service)**

**Setup Steps:**
1. Verify sender email: `noreply@yourdomain.com`
2. (Production) Move out of SES Sandbox by requesting production access
3. Configure DKIM and SPF records for domain

**IAM Permissions Required:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

**Email Templates:**
- Welcome Email (on signup)
- Password Reset Email (on forgot password)
- Email Verification (optional)

---

### 3. **AWS Lambda Functions**

**Runtime:** Node.js 20.x  
**Memory:** 512 MB (adjust based on load)  
**Timeout:** 10 seconds  
**Environment Variables:**
```bash
DYNAMODB_TABLE_NAME=Users
DYNAMODB_REGION=us-east-1
SES_REGION=us-east-1
SES_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-secret-key-here (optional for tokens)
```

---

## 🔧 Implementation Guide

### Step 1: Create DynamoDB Table

**AWS CLI Command:**
```bash
aws dynamodb create-table \
  --table-name Users \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[{
      "IndexName": "EmailIndex",
      "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
    }]' \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

**Or via AWS Console:**
1. Go to DynamoDB Console
2. Create Table
3. Table name: `Users`
4. Partition key: `id` (String)
5. Add Global Secondary Index:
   - Index name: `EmailIndex`
   - Partition key: `email` (String)

---

### Step 2: Verify AWS SES Email

**AWS CLI Command:**
```bash
aws ses verify-email-identity \
  --email-address noreply@yourdomain.com \
  --region us-east-1
```

**Check verification email and click the link**

**Test SES:**
```bash
aws ses send-email \
  --from noreply@yourdomain.com \
  --destination ToAddresses=test@example.com \
  --message Subject={Data="Test Email"},Body={Text={Data="This is a test"}} \
  --region us-east-1
```

---

### Step 3: Create Lambda Functions

#### **Lambda 1: User Signup**

**File:** `aws-lambda/userSignup.js`

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dynamoClient = new DynamoDBClient({ region: process.env.DYNAMODB_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: process.env.SES_REGION || 'us-east-1' });

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { name, email, password, role = 'customer' } = JSON.parse(event.body);

    // Validation
    if (!name || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Missing required fields' })
      };
    }

    // Check if user already exists
    const checkUserCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'Users',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    });

    const existingUser = await docClient.send(checkUserCommand);
    
    if (existingUser.Items && existingUser.Items.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ success: false, error: 'User already exists' })
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const userId = uuidv4();
    const now = new Date().toISOString();
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: now,
      updatedAt: now,
      lastLoginPlatform: 'web'
    };

    // Save to DynamoDB
    const putCommand = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'Users',
      Item: user
    });

    await docClient.send(putCommand);

    // Send welcome email via SES
    const emailParams = {
      Source: process.env.SES_FROM_EMAIL || 'noreply@yourdomain.com',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: '🎉 Welcome to Our App!' },
        Body: {
          Html: {
            Data: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .button { display: inline-block; background: #ed7734; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                  .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Welcome, ${name}!</h1>
                  </div>
                  <div class="content">
                    <h2>Thank you for joining us! 🎊</h2>
                    <p>Your account has been successfully created. You can now access all features of our platform.</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <a href="${process.env.FRONTEND_URL || 'https://yourdomain.com'}/auth/signin" class="button">Sign In Now</a>
                    <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
                  </div>
                  <div class="footer">
                    <p>&copy; 2024 Your Company. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                  </div>
                </div>
              </body>
              </html>
            `
          }
        }
      }
    };

    await sesClient.send(new SendEmailCommand(emailParams));

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userWithoutPassword,
        message: 'Account created successfully! Check your email for a welcome message.'
      })
    };

  } catch (error) {
    console.error('Signup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Internal server error' })
    };
  }
};
```

**Deploy:**
```bash
# Zip the function
cd aws-lambda
npm install bcryptjs uuid @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-ses
zip -r userSignup.zip userSignup.js node_modules/

# Upload to Lambda
aws lambda create-function \
  --function-name yourapp-userSignup \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler userSignup.handler \
  --zip-file fileb://userSignup.zip \
  --timeout 10 \
  --memory-size 512 \
  --environment Variables="{DYNAMODB_TABLE_NAME=Users,DYNAMODB_REGION=us-east-1,SES_REGION=us-east-1,SES_FROM_EMAIL=noreply@yourdomain.com,FRONTEND_URL=https://yourdomain.com}"
```

---

#### **Lambda 2: User Login**

**File:** `aws-lambda/userLogin.js`

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

const dynamoClient = new DynamoDBClient({ region: process.env.DYNAMODB_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { email, password, platform = 'web' } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Email and password required' })
      };
    }

    // Get user by email
    const queryCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'Users',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    });

    const result = await docClient.send(queryCommand);

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid credentials' })
      };
    }

    const user = result.Items[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid credentials' })
      };
    }

    // Update last login
    const updateCommand = new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'Users',
      Key: { id: user.id },
      UpdateExpression: 'SET lastLoginPlatform = :platform, updatedAt = :now',
      ExpressionAttributeValues: {
        ':platform': platform,
        ':now': new Date().toISOString()
      }
    });

    await docClient.send(updateCommand);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: userWithoutPassword,
        message: 'Login successful'
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Internal server error' })
    };
  }
};
```

**Deploy:**
```bash
cd aws-lambda
zip -r userLogin.zip userLogin.js node_modules/

aws lambda create-function \
  --function-name yourapp-userLogin \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler userLogin.handler \
  --zip-file fileb://userLogin.zip \
  --timeout 10 \
  --memory-size 512 \
  --environment Variables="{DYNAMODB_TABLE_NAME=Users,DYNAMODB_REGION=us-east-1}"
```

---

#### **Lambda 3: Forgot Password**

**File:** `aws-lambda/forgotPassword.js`

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const crypto = require('crypto');

const dynamoClient = new DynamoDBClient({ region: process.env.DYNAMODB_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({ region: process.env.SES_REGION || 'us-east-1' });

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Email required' })
      };
    }

    // Get user by email
    const queryCommand = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'Users',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    });

    const result = await docClient.send(queryCommand);

    if (!result.Items || result.Items.length === 0) {
      // Don't reveal if email exists - return success anyway
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'If email exists, reset link has been sent'
        })
      };
    }

    const user = result.Items[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    // Save reset token to user
    const updateCommand = new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'Users',
      Key: { id: user.id },
      UpdateExpression: 'SET resetToken = :token, resetTokenExpiry = :expiry, updatedAt = :now',
      ExpressionAttributeValues: {
        ':token': resetToken,
        ':expiry': resetTokenExpiry,
        ':now': new Date().toISOString()
      }
    });

    await docClient.send(updateCommand);

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/auth/reset-password?token=${resetToken}`;
    
    const emailParams = {
      Source: process.env.SES_FROM_EMAIL || 'noreply@yourdomain.com',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: '🔐 Password Reset Request' },
        Body: {
          Html: {
            Data: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .button { display: inline-block; background: #ed7734; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                  .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                  .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Password Reset</h1>
                  </div>
                  <div class="content">
                    <h2>Reset Your Password</h2>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <a href="${resetUrl}" class="button">Reset Password</a>
                    <div class="warning">
                      <strong>⚠️ Security Notice:</strong>
                      <ul>
                        <li>This link expires in 1 hour</li>
                        <li>If you didn't request this, ignore this email</li>
                        <li>Never share this link with anyone</li>
                      </ul>
                    </div>
                    <p style="margin-top: 20px; color: #666; font-size: 14px;">
                      Or copy and paste this URL into your browser:<br>
                      <code style="background: #e9ecef; padding: 5px; display: block; margin-top: 10px; word-break: break-all;">${resetUrl}</code>
                    </p>
                  </div>
                  <div class="footer">
                    <p>&copy; 2024 Your Company. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
                  </div>
                </div>
              </body>
              </html>
            `
          }
        }
      }
    };

    await sesClient.send(new SendEmailCommand(emailParams));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'If email exists, reset link has been sent'
      })
    };

  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Internal server error' })
    };
  }
};
```

---

#### **Lambda 4: Reset Password**

**File:** `aws-lambda/resetPassword.js`

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

const dynamoClient = new DynamoDBClient({ region: process.env.DYNAMODB_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { token, newPassword } = JSON.parse(event.body);

    if (!token || !newPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Token and new password required' })
      };
    }

    // Find user by reset token
    const scanCommand = new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'Users',
      FilterExpression: 'resetToken = :token',
      ExpressionAttributeValues: { ':token': token }
    });

    const result = await docClient.send(scanCommand);

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid or expired reset token' })
      };
    }

    const user = result.Items[0];

    // Check token expiry
    if (new Date(user.resetTokenExpiry) < new Date()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Reset token has expired' })
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    const updateCommand = new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || 'Users',
      Key: { id: user.id },
      UpdateExpression: 'SET password = :password, resetToken = :null, resetTokenExpiry = :null, updatedAt = :now',
      ExpressionAttributeValues: {
        ':password': hashedPassword,
        ':null': null,
        ':now': new Date().toISOString()
      }
    });

    await docClient.send(updateCommand);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Password reset successful. You can now log in with your new password.'
      })
    };

  } catch (error) {
    console.error('Reset password error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: 'Internal server error' })
    };
  }
};
```

---

### Step 4: Create API Gateway

**Create REST API:**
```bash
aws apigateway create-rest-api \
  --name "YourApp Auth API" \
  --description "Authentication API for YourApp" \
  --region us-east-1
```

**Create Resources and Methods:**

1. `/auth/signup` → POST → Lambda: `yourapp-userSignup`
2. `/auth/login` → POST → Lambda: `yourapp-userLogin`
3. `/auth/forgot-password` → POST → Lambda: `yourapp-forgotPassword`
4. `/auth/reset-password` → POST → Lambda: `yourapp-resetPassword`

**Enable CORS for each method**

**Deploy API:**
```bash
aws apigateway create-deployment \
  --rest-api-id YOUR_API_ID \
  --stage-name prod
```

**Your API Base URL:**
```
https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
```

---

## 🎨 Frontend Implementation

### Option 1: Web with NextAuth.js

**Install Dependencies:**
```bash
npm install next-auth bcryptjs
```

**File:** `auth.ts`

```typescript
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call your Lambda API
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
              })
            }
          )

          const data = await response.json()

          if (data.success && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role
            }
          }

          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'customer'
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        ;(session.user as any).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})
```

**File:** `app/auth/signup/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Call Lambda signup
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }
      )

      const data = await response.json()

      if (data.success) {
        // Auto-sign in after signup
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (result?.ok) {
          router.push('/dashboard')
        } else {
          setError('Account created but login failed. Please sign in manually.')
          router.push('/auth/signin')
        }
      } else {
        setError(data.error || 'Signup failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}
```

**File:** `app/auth/signin/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false
    })

    if (result?.ok) {
      router.push('/dashboard')
    } else {
      setError('Invalid credentials')
    }

    setLoading(false)
  }

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}
```

**File:** `app/auth/forgot-password/page.tsx`

```typescript
'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }
      )

      const data = await response.json()
      setMessage(data.message || 'Check your email for reset instructions')
    } catch (err) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  )
}
```

**File:** `app/auth/reset-password/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setError('Invalid reset link')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: password })
        }
      )

      const data = await response.json()

      if (data.success) {
        setMessage('Password reset successful! Redirecting to login...')
        setTimeout(() => router.push('/auth/signin'), 2000)
      } else {
        setError(data.error || 'Password reset failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading || !token}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}
```

---

### Option 2: Mobile with localStorage

**File:** `services/auth.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const AuthService = {
  async signup(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(data.user))
      return data.user
    }
    
    throw new Error(data.error || 'Signup failed')
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, platform: 'mobile' })
    })
    
    const data = await response.json()
    
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user))
      return data.user
    }
    
    throw new Error(data.error || 'Login failed')
  },

  logout() {
    localStorage.removeItem('user')
  },

  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}
```

---

## 📧 Email Templates

### Welcome Email Template

**Subject:** 🎉 Welcome to [Your App Name]!

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { padding: 40px 30px; background: #f9fafb; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .feature-item { padding: 15px 0; border-bottom: 1px solid #e5e7eb; }
    .feature-item:last-child { border-bottom: none; }
    .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">Welcome to [Your App]! 🎊</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">We're excited to have you on board</p>
    </div>
    
    <div class="content">
      <h2>Hi [User Name],</h2>
      <p>Thank you for creating an account with us! Your journey starts here.</p>
      
      <div class="features">
        <h3 style="margin-top: 0;">What you can do now:</h3>
        <div class="feature-item">
          <strong>✓ Access Dashboard</strong> - View and manage your account
        </div>
        <div class="feature-item">
          <strong>✓ Complete Profile</strong> - Add more details to personalize your experience
        </div>
        <div class="feature-item">
          <strong>✓ Explore Features</strong> - Discover all our platform capabilities
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="[FRONTEND_URL]/auth/signin" class="button">Get Started Now</a>
      </div>
      
      <p style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
        <strong>Need help?</strong><br>
        Our support team is here for you at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>
      </p>
    </div>
    
    <div class="footer">
      <p>&copy; 2024 [Your Company]. All rights reserved.</p>
      <p style="margin-top: 10px;">
        <a href="[FRONTEND_URL]" style="color: #667eea; text-decoration: none;">Visit Website</a> • 
        <a href="[FRONTEND_URL]/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> • 
        <a href="[FRONTEND_URL]/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

### Password Reset Email Template

**Subject:** 🔐 Password Reset Request

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { padding: 40px 30px; background: #f9fafb; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .code-box { background: #e9ecef; padding: 15px; margin: 20px 0; border-radius: 5px; font-family: monospace; word-break: break-all; }
    .footer { text-align: center; padding: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">🔐 Password Reset</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">We received a request to reset your password</p>
    </div>
    
    <div class="content">
      <h2>Hi there,</h2>
      <p>Someone requested a password reset for your account. If this was you, click the button below to create a new password:</p>
      
      <div style="text-align: center;">
        <a href="[RESET_URL]" class="button">Reset My Password</a>
      </div>
      
      <div class="warning">
        <strong>⚠️ Security Notice:</strong>
        <ul style="margin: 10px 0;">
          <li>This link expires in <strong>1 hour</strong></li>
          <li>If you didn't request this, you can safely ignore this email</li>
          <li>Your password will remain unchanged until you click the link</li>
          <li>Never share this link with anyone</li>
        </ul>
      </div>
      
      <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
      <div class="code-box">[RESET_URL]</div>
      
      <p style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        If you didn't request a password reset, please contact our support team immediately at 
        <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>
      </p>
    </div>
    
    <div class="footer">
      <p>&copy; 2024 [Your Company]. All rights reserved.</p>
      <p style="margin-top: 10px;">This is an automated security email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
```

---

## 🔒 Security Best Practices

### 1. Password Security
- ✅ Use bcrypt with salt rounds ≥ 10
- ✅ Minimum password length: 8 characters
- ✅ Never store plain text passwords
- ✅ Never log passwords

### 2. Token Security
- ✅ Reset tokens expire in 1 hour
- ✅ Tokens are cryptographically random (32 bytes)
- ✅ Clear tokens after use
- ✅ Rate limit password reset requests

### 3. API Security
- ✅ Enable CORS with specific origins
- ✅ Validate all inputs
- ✅ Use HTTPS only in production
- ✅ Implement rate limiting on Lambda
- ✅ Don't reveal if email exists (security through obscurity)

### 4. Email Security
- ✅ Verify sender domain with DKIM/SPF
- ✅ Use verified SES email addresses
- ✅ Include unsubscribe links (for marketing emails)
- ✅ Don't include sensitive data in emails

---

## 📊 Monitoring & Logging

### CloudWatch Logs
- Monitor Lambda execution logs
- Set up alarms for errors
- Track failed login attempts
- Monitor API Gateway metrics

### Metrics to Track
- Sign-up success rate
- Login success rate
- Password reset requests
- Email delivery rate
- API response times
- Lambda cold starts

---

## 💰 Cost Estimation

### AWS Services Monthly Cost (estimated for 10,000 users)

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 50,000 invocations | $0.20 |
| DynamoDB | 100,000 reads/writes | $1.25 |
| API Gateway | 50,000 requests | $0.18 |
| SES | 10,000 emails | $1.00 |
| **Total** | | **~$2.63/month** |

---

## 🧪 Testing Checklist

### Sign Up Flow
- [ ] Valid email/password creates account
- [ ] Duplicate email returns error
- [ ] Welcome email is sent
- [ ] User is auto-logged in after signup
- [ ] Password is hashed in database
- [ ] Missing fields return validation errors

### Sign In Flow
- [ ] Valid credentials log in successfully
- [ ] Invalid credentials return error
- [ ] Last login platform is updated
- [ ] Session/token is created

### Forgot Password Flow
- [ ] Reset email is sent to valid email
- [ ] Invalid email doesn't reveal existence
- [ ] Reset link expires after 1 hour
- [ ] Reset token is stored in database
- [ ] Rate limiting prevents abuse

### Reset Password Flow
- [ ] Valid token allows password reset
- [ ] Expired token returns error
- [ ] Invalid token returns error
- [ ] Password is hashed before saving
- [ ] Reset token is cleared after use
- [ ] User can login with new password

---

## 🚀 Deployment Steps

1. **Create DynamoDB table** with EmailIndex GSI
2. **Verify SES email** and move out of sandbox
3. **Deploy Lambda functions** with environment variables
4. **Create API Gateway** REST API
5. **Link Lambda functions** to API routes
6. **Enable CORS** on all API methods
7. **Deploy API** to production stage
8. **Test all endpoints** with Postman/curl
9. **Update frontend** with API URL
10. **Test complete flows** end-to-end

---

## 📝 Environment Variables Reference

### Lambda Functions
```bash
DYNAMODB_TABLE_NAME=Users
DYNAMODB_REGION=us-east-1
SES_REGION=us-east-1
SES_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=your-super-secret-key-change-this
```

### Frontend (Next.js)
```bash
NEXT_PUBLIC_API_BASE_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret-key
```

---

## 🎯 Quick Start Commands

```bash
# 1. Create DynamoDB table
aws dynamodb create-table --table-name Users --cli-input-json file://dynamodb-table.json

# 2. Verify SES email
aws ses verify-email-identity --email-address noreply@yourdomain.com

# 3. Deploy Lambda functions
cd aws-lambda && npm install
zip -r functions.zip *.js node_modules/
aws lambda create-function --cli-input-json file://lambda-config.json

# 4. Create API Gateway
aws apigateway create-rest-api --name "Auth API"

# 5. Deploy API
aws apigateway create-deployment --rest-api-id YOUR_API_ID --stage-name prod

# 6. Test endpoint
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

---

## 🔧 Troubleshooting

### Common Issues

**1. User signup fails silently**
- Check Lambda CloudWatch logs
- Verify DynamoDB table exists
- Check IAM permissions

**2. Welcome email not received**
- Verify SES email address
- Check SES sending limits (sandbox mode)
- Look in spam folder
- Check CloudWatch logs for SES errors

**3. Password reset link doesn't work**
- Check token expiry (1 hour limit)
- Verify FRONTEND_URL environment variable
- Check for URL encoding issues

**4. CORS errors in browser**
- Enable CORS on API Gateway methods
- Check Access-Control-Allow-Origin header
- Verify API deployment

**5. NextAuth session not persisting**
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Check cookies are enabled

---

## 🏠 Homepage Authentication Redirect Pattern

### **Best Practice: Role-Based Homepage Routing**

Most modern web applications redirect authenticated users directly to their dashboard instead of showing the landing page. This improves UX by reducing unnecessary clicks.

#### **Implementation Pattern**

**Root Page (`app/page.tsx`):**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { getDefaultRoute } from '@/lib/roles';

const WebHomepage = dynamic(() => import('./web-homepage'), { ssr: false });

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if running in Capacitor mobile app
    if (typeof window !== 'undefined') {
      const isCapacitor = !!(window as any).Capacitor;
      setIsMobile(isCapacitor);
      
      if (isCapacitor) {
        router.replace('/mobile');
      } else {
        setIsChecking(false);
      }
    }
  }, [router]);

  // Redirect authenticated users to their role-based dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role && !isMobile) {
      const defaultRoute = getDefaultRoute(
        session.user.role as 'admin' | 'manager' | 'driver' | 'customer'
      );
      router.replace(defaultRoute);
    }
  }, [status, session, router, isMobile]);

  // Show web homepage for unauthenticated users only
  if (!isChecking && !isMobile && status !== 'authenticated') {
    return <WebHomepage />;
  }

  // Loading screen during auth check
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    </div>
  );
}
```

#### **Role Definitions (`lib/roles.ts`):**

```typescript
export type UserRole = 'admin' | 'user' | 'customer' | 'driver' | 'manager';

export const ROLE_DEFINITIONS: Record<UserRole, RolePermissions> = {
  admin: {
    defaultRoute: '/admin',
    // ... other properties
  },
  manager: {
    defaultRoute: '/manager',
    // ... other properties
  },
  driver: {
    defaultRoute: '/driver',
    // ... other properties
  },
  customer: {
    defaultRoute: '/customer',
    // ... other properties
  },
  user: {
    defaultRoute: '/',
    // ... other properties
  }
};

export function getDefaultRoute(userRole: UserRole): string {
  return ROLE_DEFINITIONS[userRole].defaultRoute;
}
```

#### **User Flow:**

```bash
# Unauthenticated user visits homepage
http://localhost:3100/ → Shows landing page (marketing content)

# User signs in as Admin
http://localhost:3100/ → Automatically redirects to /admin

# User signs in as Customer
http://localhost:3100/ → Automatically redirects to /customer

# User signs in as Driver
http://localhost:3100/ → Automatically redirects to /driver

# User signs in as Manager
http://localhost:3100/ → Automatically redirects to /manager
```

#### **Benefits:**

✅ **Better UX** - Users land directly in their workspace  
✅ **Fewer clicks** - No need to navigate from homepage → login → dashboard  
✅ **Role-based** - Each user type gets their appropriate view  
✅ **Standard pattern** - Matches behavior of Gmail, GitHub, AWS Console, etc.  
✅ **Security** - Landing page only visible to unauthenticated users  

#### **Important Notes:**

⚠️ The landing page (`web-homepage.tsx`) should still handle authenticated users gracefully if accessed directly (e.g., via direct URL or back button)

⚠️ Use `router.replace()` instead of `router.push()` to prevent users from using the back button to return to the homepage after authentication

⚠️ Always check authentication status before redirecting to prevent infinite loops

---

## 📚 Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [SES Developer Guide](https://docs.aws.amazon.com/ses/latest/dg/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [bcrypt.js GitHub](https://github.com/dcodeIO/bcrypt.js)

---

## 📄 License

This blueprint is provided as-is for educational and development purposes.

---

**Last Updated:** November 24, 2025  
**Version:** 1.1.0  
**Maintained by:** Your Team

