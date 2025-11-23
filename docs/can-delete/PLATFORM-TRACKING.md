# Platform Tracking System

## Overview
The system now tracks whether user accounts are created and accessed from the web application or mobile app. This enables platform-specific analytics, features, and user management.

## Implementation Details

### 1. Database Schema (`lib/dynamodb.ts`)
Added two new fields to the `User` interface:

- **`platform?: 'web' | 'mobile'`** - Records the platform where the account was originally created
- **`lastLoginPlatform?: 'web' | 'mobile'`** - Records the most recent platform used for login

### 2. Platform Detection Utility (`lib/platform.ts`)
Created a centralized utility module with the following functions:

- **`detectPlatform()`** - Returns `'mobile'` if running in Capacitor (mobile app), otherwise `'web'`
- **`isMobilePlatform()`** - Boolean check if current platform is mobile
- **`isWebPlatform()`** - Boolean check if current platform is web
- **`getPlatformName()`** - Returns human-readable platform name

**Detection Logic:**
```typescript
const isCapacitor = !!(window as any).Capacitor;
return isCapacitor ? 'mobile' : 'web';
```

### 3. Mobile Signup (`mobile-android/shared/components/EnhancedSignUp.tsx`)
**Implementation:**
- Imports `detectPlatform()` from platform utility
- Detects platform during account creation
- Stores both `platform` and `lastLoginPlatform` in user data
- Adds timestamp with `createdAt` field

**Code:**
```typescript
const platform = detectPlatform();
const newUser = {
  name, email, role,
  platform,              // Creation platform
  lastLoginPlatform: platform,
  createdAt: new Date().toISOString()
};
```

### 4. Mobile Signin (`mobile-android/shared/components/EnhancedSignIn.tsx`)
**Implementation:**
- Imports `detectPlatform()` from platform utility
- Detects platform during signin
- Updates `lastLoginPlatform` in localStorage
- Updates timestamp with `updatedAt`

**Code:**
```typescript
const platform = detectPlatform();
const updatedUser = {
  ...currentUser,
  lastLoginPlatform: platform,
  updatedAt: new Date().toISOString()
};
localStorage.setItem(`user_${currentUser.email}`, JSON.stringify(updatedUser));
```

### 5. Web Authentication (`auth.ts`)
**Server-Side Detection:**
```typescript
function detectPlatformServer(): 'web' | 'mobile' {
  return 'web'; // NextAuth runs on server, so always 'web'
}
```

**Credentials Provider:**
- Detects platform on signin
- Updates `lastLoginPlatform` in DynamoDB
- Updates timestamp

**OAuth Providers (Google, Facebook, Twitter):**
- New users: Sets both `platform` and `lastLoginPlatform` to `'web'`
- Existing users: Updates `lastLoginPlatform` on each signin
- Handles provider info updates for first-time OAuth users

## Platform Detection Logic

### Mobile App (Capacitor)
- Capacitor framework adds `window.Capacitor` object
- Detection: `!!(window as any).Capacitor === true`
- Used by: Mobile signin/signup components

### Web Application (NextAuth)
- Runs on Node.js server (no window object)
- Detection: Server-side always returns `'web'`
- Used by: auth.ts for web authentication

## Data Flow

### Signup Flow
1. User enters credentials in signup form
2. Platform is detected (`detectPlatform()`)
3. New user object created with:
   - `platform`: Creation platform
   - `lastLoginPlatform`: Same as creation platform
   - `createdAt`: Current timestamp
4. User saved to storage/database

### Signin Flow
1. User enters credentials in signin form
2. Platform is detected
3. Existing user data retrieved
4. Updated with:
   - `lastLoginPlatform`: Current platform
   - `updatedAt`: Current timestamp
5. Updated user saved to storage/database

## Use Cases

### Analytics
- Track user distribution (web vs mobile)
- Analyze platform preferences
- Monitor cross-platform usage patterns

### Feature Management
- Enable platform-specific features
- Show different UI for mobile users
- Customize notifications based on platform

### User Management
- Filter users by platform in admin dashboard
- Identify inactive users on specific platforms
- Target platform-specific communications

### Security
- Detect unusual platform switches
- Monitor for suspicious cross-platform activity
- Audit login patterns

## Testing

### Web Testing
1. Open app in browser (http://localhost:3100)
2. Sign up/sign in
3. Expected: `platform: 'web'`, `lastLoginPlatform: 'web'`

### Mobile Testing
1. Build and run mobile app
2. Sign up/sign in within mobile app
3. Expected: `platform: 'mobile'`, `lastLoginPlatform: 'mobile'`

### Cross-Platform Testing
1. Create account on web
2. Sign in from mobile app
3. Expected: `platform: 'web'`, `lastLoginPlatform: 'mobile'`

## Future Enhancements

### Admin Dashboard
- Add platform indicator in user list
- Show platform statistics
- Filter users by platform

### Analytics Dashboard
- Chart: Web vs Mobile user distribution
- Chart: Platform login frequency
- Table: Cross-platform usage patterns

### Notifications
- Send platform-specific push notifications
- Customize email templates by platform
- Target inactive users on specific platforms

## Technical Notes

### Type Safety
- Platform type: `'web' | 'mobile'` (union type)
- Optional fields: `platform?` and `lastLoginPlatform?`
- Backward compatible: Existing users without platform data will work

### Storage
- Mobile: localStorage with keys `user_{email}` and `currentUser`
- Web: DynamoDB via NextAuth sessions
- Both: Store same data structure for consistency

### Error Handling
- Platform detection never throws errors
- Defaults to `'web'` if detection fails
- Gracefully handles missing Capacitor object

## Files Modified

1. **lib/dynamodb.ts** - Added platform fields to User interface
2. **lib/platform.ts** - New file with detection utilities
3. **mobile-android/shared/components/EnhancedSignUp.tsx** - Added platform tracking on signup
4. **mobile-android/shared/components/EnhancedSignIn.tsx** - Added platform tracking on signin
5. **auth.ts** - Added platform tracking for web authentication

## Commit Message Suggestion
```
feat: Add platform tracking to distinguish web vs mobile accounts

- Add platform and lastLoginPlatform fields to User interface
- Create platform detection utility (lib/platform.ts)
- Update mobile signup/signin to track platform
- Update NextAuth to track platform for web users
- Support cross-platform account usage tracking
```
