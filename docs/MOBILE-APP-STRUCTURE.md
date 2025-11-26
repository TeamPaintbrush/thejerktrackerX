# The JERK Tracker Mobile App - Complete Screen Map

## 🏗️ App Architecture

**Bottom Navigation (4 tabs - always visible except on splash/settings pages):**
1. **Dashboard** - `/mobile/dashboard`
2. **Orders** - `/mobile/orders-hub`  
3. **QR Code** - `/mobile/qr`
4. **Settings** - `/mobile/settings`

---

## 📱 Screen Hierarchy & Flow

### 1. Entry & Authentication Screens

```
/mobile (page.tsx)
├─ Mobile splash/landing page
├─ Redirects authenticated users to dashboard
└─ Shows login/signup options for guests

/mobile/login (page.tsx)
├─ Login form
└─ → Redirects to role-based dashboard after login

/mobile/signup (page.tsx)
├─ Sign up form
└─ → Auto-login & redirect to /mobile/customer after signup

/mobile/how-it-works (page.tsx)
└─ Onboarding/info page

/mobile/pricing (page.tsx)
└─ Pricing information page
```

---

### 2. Dashboard (Tab 1 - Home Icon)

```
/mobile/dashboard (page.tsx)
├─ Role-based dashboard hub
├─ Detects user role and shows:
│  ├─ Customer dashboard widgets
│  ├─ Driver dashboard widgets
│  ├─ Manager dashboard widgets
│  └─ Admin dashboard widgets
└─ Quick action buttons based on role
```

**Role-Specific Dashboards:**

```
/mobile/customer (page.tsx)
├─ Customer dashboard
├─ View active orders
├─ Place new order button
└─ Order history

/mobile/driver (page.tsx)
├─ Driver dashboard
├─ Available orders to pick up
├─ Current deliveries
└─ Delivery history

/mobile/driver/menu (page.tsx)
└─ Driver-specific menu/options

/mobile/manager (page.tsx)
├─ Manager dashboard
├─ Location management
├─ Staff oversight
└─ Order monitoring

/mobile/manager/menu (page.tsx)
└─ Manager-specific menu/options

/mobile/admin (page.tsx)
├─ Admin dashboard
├─ Full system access
├─ User management
└─ Analytics overview
```

**Admin Sub-Screens:**

```
/mobile/admin/analytics (page.tsx)
└─ Business analytics & reports

/mobile/admin/fraud-claims (page.tsx)
└─ Fraud detection & claims management

/mobile/admin/menu (page.tsx)
└─ Admin menu options

/mobile/admin/orders (page.tsx)
└─ All orders across all locations

/mobile/admin/users (page.tsx)
└─ User management (create/edit/delete users)
```

---

### 3. Orders Hub (Tab 2 - Clipboard Icon)

```
/mobile/orders-hub (page.tsx)
├─ Central orders management
├─ Filter by status (pending/picked up/delivered)
├─ Search orders
└─ View all orders for current user role

/mobile/orders (page.tsx)
└─ Orders list view (alternative view)

/mobile/orders/create (page.tsx)
├─ Create new order form
├─ Select location
├─ Enter order details
└─ Submit order → Creates in DynamoDB

/mobile/orders/[id] (page.tsx)
├─ Order details view (dynamic route)
├─ Order status tracking
├─ Customer info
├─ Delivery info
└─ Actions (mark picked up/delivered)
```

---

### 4. QR Code Scanner (Tab 3 - Barcode Icon)

```
/mobile/qr (page.tsx)
├─ QR code scanner
├─ Uses Capacitor Camera plugin
├─ Scans order QR codes
└─ Redirects to order detail page

/mobile/qr/manager (page.tsx)
└─ Manager-specific QR code features
    ├─ Generate QR codes for locations
    └─ Verify order pickups
```

---

### 5. Settings (Tab 4 - Settings Icon)

```
/mobile/settings (page.tsx)
├─ Settings hub page
├─ Profile settings link
├─ Security settings link
├─ Notifications link
├─ Billing link
├─ Locations link
├─ Branding link
└─ Logout button

/mobile/settings/profile (page.tsx)
├─ Edit name, email
├─ Change avatar
└─ Update contact info

/mobile/settings/security (page.tsx)
├─ Change password
├─ Two-factor authentication
└─ Login history

/mobile/settings/notifications (page.tsx)
├─ Push notification preferences
├─ Email notifications
└─ SMS alerts

/mobile/settings/billing (page.tsx)
├─ Payment methods
├─ Billing history
└─ Subscription management

/mobile/settings/locations (page.tsx)
├─ Manage business locations
├─ Add/edit/delete locations
└─ GPS verification settings

/mobile/settings/branding (page.tsx)
├─ Business logo upload
├─ Brand colors
└─ Custom messaging
```

---

### 6. Additional Features

```
/mobile/fraud-claims (page.tsx)
├─ Report fraudulent orders
├─ View claim status
└─ Submit evidence
```

---

## 🔗 Navigation Flow Summary

### New User Journey:
1. Open app → `/mobile` (splash)
2. Tap "Sign Up" → `/mobile/signup`
3. Complete signup → Auto-login → `/mobile/customer`
4. Bottom nav appears (Dashboard | Orders | QR | Settings)

### Existing User Journey:
1. Open app → `/mobile` (checks localStorage)
2. Auto-redirect to `/mobile/dashboard` (role-based)
3. Bottom nav visible on all screens except settings pages

### Order Creation Flow:
1. From Dashboard → "Place New Order" button
2. → `/mobile/orders/create`
3. Fill form → Submit
4. → Back to `/mobile/orders-hub` or `/mobile/customer`

### QR Code Flow:
1. Tap QR tab → `/mobile/qr`
2. Scan QR code
3. → `/mobile/orders/[id]` (order details)

---

## 🎨 Key Components Used Across Screens

- **MobileLayout** (`mobile-android/shared/components/MobileLayout.tsx`) - Wraps all mobile pages, adds safe areas
- **BottomNavigation** (`mobile-android/shared/components/BottomNavigation.tsx`) - 4-tab navigation at bottom
- **EnhancedSignIn** (`mobile-android/shared/components/EnhancedSignIn.tsx`) - Login form (used in `/mobile/login`)
- **EnhancedSignUp** (`mobile-android/shared/components/EnhancedSignUp.tsx`) - Signup form (used in `/mobile/signup`)

---

## 📊 Screen Statistics

- **34 total mobile screens**
- **4 main navigation tabs**
- **5 role-specific dashboards** (customer, driver, manager, admin, generic)
- **7 settings sub-pages**
- **6 admin sub-pages**
- **3 order-related pages** (hub, create, detail view)

---

## 🔐 Authentication & Data

- **Authentication**: AWS Lambda (userLogin, userSignup)
- **Database**: DynamoDB (Users, Orders, Locations tables)
- **Session Storage**: localStorage (`mobile_auth_user`)
- **API Base**: `https://rqbyr7htb1.execute-api.us-east-1.amazonaws.com/prod`

---

## 🚀 Build & Deploy

### Development:
```bash
npm run dev  # Web on port 3100
```

### Mobile Build:
```bash
npm run build:mobile     # Static export
npx cap sync android     # Sync to Android
npx cap open android     # Open in Android Studio
```

### Production Release:
```powershell
.\build-sdk35.ps1  # Build signed AAB for Google Play Store
```

---

*Last Updated: November 24, 2025*
