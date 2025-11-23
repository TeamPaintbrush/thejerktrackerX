# Web/Mobile Routing Fix

## Problem
When users signed in on the **website**, they were being redirected to **mobile routes** (e.g., `/mobile/dashboard`) instead of web routes (e.g., `/admin`, `/orders`). This happened because the `EnhancedSignIn` component was using `MobileAuth.getDefaultRoute()` which always returns mobile paths.

## Root Cause
The `EnhancedSignIn` component is shared between web and mobile platforms, but was only using the mobile auth service's routing logic:

```typescript
// OLD CODE - Always redirected to mobile routes
const getDefaultRoute = (role?: string): string => {
  return MobileAuth.getDefaultRoute(role || 'customer');
};
```

## Solution
Updated `EnhancedSignIn.tsx` to detect the platform and use the appropriate routing logic:

```typescript
// NEW CODE - Platform-aware routing
const getDefaultRoute = (role?: string): string => {
  const platform = detectPlatform();
  
  if (platform === 'mobile') {
    // Mobile app - use mobile routes
    return MobileAuth.getDefaultRoute(role || 'customer');
  } else {
    // Web browser - use web routes
    const userRole = (role || 'customer') as 'admin' | 'manager' | 'driver' | 'customer' | 'user';
    return getWebDefaultRoute(userRole);
  }
};
```

## Changes Made

### File: `mobile-android/shared/components/EnhancedSignIn.tsx`

1. **Added import** for web routing:
   ```typescript
   import { getDefaultRoute as getWebDefaultRoute } from '../../../lib/roles';
   ```

2. **Updated `getDefaultRoute` function** to be platform-aware:
   - Detects platform using `detectPlatform()`
   - Routes to `/mobile/*` paths if on mobile app (Capacitor)
   - Routes to web paths (`/admin`, `/orders`, etc.) if on web browser

## Routing Logic

### Web Browser Users
When users sign in on the **website**, they are redirected to:
- **Admin:** `/admin` (admin dashboard)
- **Manager:** `/orders` (order management)
- **Driver:** `/orders` (order tracking)
- **Customer/User:** `/` (homepage)

### Mobile App Users
When users sign in on the **mobile app**, they are redirected to:
- **Admin:** `/mobile/dashboard` (mobile admin dashboard)
- **Manager:** `/mobile/orders` (mobile orders management)
- **Driver:** `/mobile/orders` (mobile orders for drivers)
- **Customer:** `/mobile/dashboard` (mobile customer dashboard)

## Platform Detection
Uses the existing `detectPlatform()` utility from `lib/platform.ts`:
- Returns `'mobile'` if `window.Capacitor` exists (Capacitor app)
- Returns `'web'` if running in regular browser

## Testing

### Test Web Signin
1. Open http://localhost:3100/auth/signin in browser
2. Sign in with credentials
3. **Expected Result:** Redirects to web route (e.g., `/admin` for admin users)

### Test Mobile Signin
1. Open mobile app
2. Navigate to signin screen
3. Sign in with credentials
4. **Expected Result:** Redirects to mobile route (e.g., `/mobile/dashboard`)

## Web Route Mapping
Based on `lib/roles.ts`:
- **admin** → `/admin`
- **manager** → `/orders`
- **driver** → `/orders`
- **customer** → `/`
- **user** → `/`

## Mobile Route Mapping
Based on `mobile-android/shared/services/mobileAuth.ts`:
- **admin** → `/mobile/dashboard`
- **manager** → `/mobile/orders`
- **driver** → `/mobile/orders`
- **customer** → `/mobile/dashboard`
- **default** → `/mobile`

## Status
✅ Fix implemented  
✅ No TypeScript errors  
✅ Server compiled successfully  
✅ Ready for testing

## Related Files
- `mobile-android/shared/components/EnhancedSignIn.tsx` - Fixed routing logic
- `lib/platform.ts` - Platform detection utility
- `lib/roles.ts` - Web route definitions
- `mobile-android/shared/services/mobileAuth.ts` - Mobile route definitions
