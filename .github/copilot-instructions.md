# The JERK Tracker X - AI Coding Agent Instructions

## Project Overview
This is a **production-ready, dual-platform restaurant order tracking system** available on Google Play Store. It's a Next.js 15 web app with NextAuth.js authentication and a native Android mobile app built with Capacitor. The codebase serves **both platforms from a single Next.js project** using build-time configuration.

**Status:** ✅ Production (Google Play Store Live) | AWS DynamoDB Backend Configured

## Critical Architecture Patterns

### Dual-Platform Build System
This project has **two distinct build modes** controlled by `BUILD_TARGET` environment variable:

```bash
# Web build (default) - includes NextAuth, API routes, SSR
npm run build

# Mobile build - static export, excludes API routes, uses client-side auth
npm run build:mobile
```

**Key implementation details:**
- `next.config.js` switches between SSR and static export based on `BUILD_TARGET=mobile`
- Web uses NextAuth.js (`auth.ts`, `/api/auth/[...nextauth]`)
- Mobile uses `mobile-android/shared/services/mobileAuth.ts` (localStorage-based)
- During mobile builds, temporarily rename `app/api` to `app/api.disabled` (see `build-sdk35.ps1`)

### Directory Structure Pattern
- **Web pages**: `app/{route}/page.tsx` (e.g., `/admin`, `/settings`, `/customer`)
- **Mobile pages**: `app/mobile/{route}/page.tsx` (e.g., `/mobile/admin`, `/mobile/settings`)
- **Shared components**: `components/` (used by both platforms)
- **Mobile-only components**: `mobile-android/shared/components/` (e.g., `BottomNavigation.tsx`, `MobileLayout.tsx`)

**Example:** Admin dashboard exists at both `app/admin/page.tsx` (web) and `app/mobile/admin/page.tsx` (mobile), often sharing components from `components/admin/`.

### Authentication Architecture
**Web (NextAuth.js):**
```typescript
// auth.ts - Server-side NextAuth configuration
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// Uses DynamoDB for user storage
```

**Mobile (Client-side with DynamoDB sync):**
```typescript
// mobile-android/shared/services/mobileAuth.ts
class MobileAuthService {
  async signIn(email: string, password: string) {
    // Production: Authenticates against DynamoDB backend
    // Development: Falls back to mock accounts for local testing
    // Stores session in localStorage for offline access
  }
}
```

**Never mix these systems** - web pages use `auth.ts`, mobile pages use `mobileAuth.ts`. Both systems authenticate against the same DynamoDB backend in production.

### Data Layer Pattern
Primary data service: `lib/dynamodb.ts` - handles Orders, Users, Locations with AWS DynamoDB.

```typescript
export class DynamoDBService {
  static async createOrder(order: Order): Promise<Order>
  static async getUserByEmail(email: string): Promise<User | null>
  static async createLocation(location: Location): Promise<Location>
}
```

**Critical interfaces:**
- `Order` - includes `location` object with billing/verification data
- `Location` - multi-location support with GPS verification and per-location billing
- `User` - role-based (`admin` | `manager` | `driver` | `customer`)

### Styling System
Uses **Styled Components** with centralized theme:
- Theme: `styles/theme.ts` - color palette, spacing, breakpoints
- Global styles: `styles/components.ts` - `GlobalStyles` component
- Mobile-specific: `styles/responsive-fixes.css` for Capacitor viewport

```typescript
// Example component pattern
import styled from 'styled-components';

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing[4]};
`;
```

## Development Workflows

### Web Development
```bash
npm run dev                    # Port 3100 (see package.json)
# Visit http://localhost:3100
```

### Android Development & Production Builds
```bash
npm run build:mobile          # Build Next.js static export
npx cap sync android          # Sync to Android project
npx cap open android          # Open Android Studio (requires Java 17+)
# Build in Android Studio with targetSdkVersion 35 (see android/app/build.gradle)
```

**Production release builds:** Use the PowerShell script for Google Play Store releases:
```powershell
.\build-sdk35.ps1  # Handles API folder disabling, build, sync, signing with release keystore
```

**Release configuration:**
- Keystore configured in `android/keystore.properties` (production keys secured)
- Version code/name managed in `android/app/build.gradle`
- Signed AAB (Android App Bundle) generated for Play Store upload
- See `GOOGLE-PLAY-RELEASE-GUIDE.md` for complete release workflow

### Testing Authentication
**Production app** (Google Play Store):
- Users create accounts via sign-up flow
- Authentication synced across web and mobile via DynamoDB

**Development test accounts** (see `mobileAuth.ts` lines 50-74 for local testing):
- `admin@jerktrackerx.com` / `admin123` (role: admin)
- `manager@jerktrackerx.com` / `manager123` (role: manager)
- `driver@jerktrackerx.com` / `driver123` (role: driver)
- `customer@jerktrackerx.com` / `customer123` (role: customer)

**Note:** Test accounts are for development only. Production users register through the app's sign-up flow.

## Project-Specific Conventions

### Role-Based Routing Pattern
Each role has dedicated dashboard routes on both platforms:

| Role | Web Route | Mobile Route |
|------|-----------|--------------|
| Admin | `/admin` | `/mobile/admin` |
| Manager | `/manager` | `/mobile/manager` |
| Driver | `/driver` | `/mobile/driver` |
| Customer | `/customer` | `/mobile/customer` |

**Implementation:** Mobile routes use `mobileAuth.ts` role detection to render appropriate dashboard.

### Component Sharing Pattern
When creating features, follow this pattern:
1. Build reusable logic in `components/` (e.g., `OrderForm.tsx`)
2. Create web page at `app/{route}/page.tsx` importing shared component
3. Create mobile page at `app/mobile/{route}/page.tsx` wrapping same component in `MobileLayout`

**Example from codebase:**
```typescript
// components/OrderForm.tsx - shared
export function OrderForm({ onSubmit }: OrderFormProps) { }

// app/order/page.tsx - web version
import { OrderForm } from '@/components/OrderForm';

// app/mobile/orders/create/page.tsx - mobile version  
import { OrderForm } from '@/components/OrderForm';
import MobileLayout from '@/mobile-android/shared/components/MobileLayout';
```

### Mobile Layout Wrapper
**Every mobile page** must use `MobileLayout` for safe areas and bottom navigation:

```typescript
'use client';
import MobileLayout from '@/mobile-android/shared/components/MobileLayout';

export default function MobilePage() {
  return (
    <MobileLayout>
      {/* Your content */}
    </MobileLayout>
  );
}
```

Bottom navigation: 4 icons (Dashboard, Orders, QR Code, Settings) - defined in `mobile-android/shared/components/BottomNavigation.tsx`.

## Integration Points

### AWS DynamoDB (Production Ready)
Tables are **already configured in production** (setup scripts in `aws-setup/` for reference only):
- `Orders` - partition key: `id`
- `Users` - partition key: `id`, GSI on `email`
- `Locations` - partition key: `id`

Environment variables (production credentials already configured):
```env
AWS_ACCESS_KEY_ID=<configured>
AWS_SECRET_ACCESS_KEY=<configured>
AWS_REGION=us-east-1
```

**Note:** Web and mobile apps share the same DynamoDB backend for unified data across platforms.

### Capacitor Native Features
Mobile app uses Capacitor plugins (see `package.json` dependencies):
- `@capacitor/camera` - QR code scanning
- `@capacitor/geolocation` - location verification
- `@capacitor/push-notifications` - order notifications
- `@capacitor/status-bar` - Android status bar theming

**Configuration:** `capacitor.config.ts` sets `webDir: 'out'` (Next.js static export output).

## Common Gotchas

1. **API routes in mobile builds** - They must be excluded. The build script renames `app/api` to `app/api.disabled` during mobile builds.

2. **Hydration warnings** - `layout.tsx` sets `reactStrictMode: false` for styled-components. Use `suppressHydrationWarning` on dynamic content.

3. **Mobile auth vs web auth** - Never import `auth.ts` in mobile pages or `mobileAuth.ts` in web pages. Check the route prefix (`/mobile/*`) to determine platform.

4. **Java 17 requirement** - Android builds fail with other Java versions. Android Studio's bundled Gradle handles this automatically.

5. **Theme access** - Components must be wrapped in `<ThemeProvider theme={theme}>` (see `app/layout.tsx`) to access theme via `props.theme`.

## Documentation Index
Essential files for understanding the codebase:
- `docs/USED_VS_UNUSED.md` - Current file status (92.3% active usage)
- `docs/WEBSITE-VS-MOBILE-COMPARISON.md` - Platform feature parity
- `docs/INDEX.md` - Documentation navigation
- `README.md` - Quick start guide
- `GOOGLE-PLAY-RELEASE-GUIDE.md` - Android release process

When in doubt about whether a file is still used, check `docs/USED_VS_UNUSED.md` first.
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.