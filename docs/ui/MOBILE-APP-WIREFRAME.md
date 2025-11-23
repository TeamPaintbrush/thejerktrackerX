# 📱 Mobile App Wireframe & Component Flow

## 🎯 Current Issue: "Welcome back!" Dashboard Overlay
**Problem:** Customer dashboard is appearing over the main homepage on mobile app startup

---

## 📊 Mobile App Architecture Flow

```
🏠 Mobile App Entry Point
├── app/layout.tsx (Root Layout)
│   ├── Detects /mobile/* paths
│   ├── Loads MobileLayout wrapper
│   └── Provides SessionProvider & ThemeProvider
│
└── 📱 MOBILE ROUTES (/mobile/*)
    │
    ├── 🎯 /mobile (ROOT - MAIN ISSUE HERE)
    │   ├── app/mobile/page.tsx ✅ "The Main JERK Tracker Homepage"
    │   ├── Forces auth clear on load
    │   ├── Shows homepage content
    │   └── 🚨 BUT "Welcome back!" still appears somehow
    │
    ├── 🏢 /mobile/dashboard
    │   ├── app/mobile/dashboard/page.tsx 
    │   ├── Contains "Welcome back!" message
    │   ├── Should ONLY load when user clicks Dashboard
    │   └── 🚨 Might be auto-loading/overlaying
    │
    ├── 📦 /mobile/orders-hub
    │   ├── app/mobile/orders-hub/page.tsx
    │   ├── Also has "Welcome back!" message
    │   └── Hub for order management
    │
    ├── 🔧 /mobile/settings
    │   ├── app/mobile/settings/page.tsx
    │   ├── Settings grid with 7 options
    │   └── BackButton → /mobile/dashboard
    │
    └── 📱 Other Mobile Pages
        ├── /mobile/qr
        ├── /mobile/orders
        ├── /mobile/admin/*
        └── /mobile/settings/*
```

---

## 🔄 Authentication & State Flow

```
📱 Mobile App Loads
├── app/layout.tsx
│   ├── SessionProvider (NextAuth)
│   ├── Detects mobile path
│   └── Wraps in MobileLayout
│
├── mobile-android/shared/components/MobileLayout.tsx
│   ├── Adds BottomNavigation
│   ├── Safe area padding
│   └── Contains all mobile content
│
└── 🎯 app/mobile/page.tsx (ROOT PAGE)
    ├── useSession() hook
    ├── Force clears localStorage
    ├── Shows homepage content
    ├── 🚨 Session might trigger dashboard
    └── 🚨 Unknown component rendering dashboard
```

---

## 🧩 Component Relationships

```
app/mobile/page.tsx (Homepage)
├── Import: useSession from next-auth/react
├── Import: Container, Button, Heading from styles
├── Contains: Hero section, features, pricing
├── 🚨 Might have hidden redirect logic
└── 🚨 Session state causing dashboard render?

🆚

app/mobile/dashboard/page.tsx (Dashboard)
├── Import: useMobileAuth hook
├── Contains: "Welcome back!" message
├── Shows: Stats, quick actions, recent orders
├── 🚨 Might be auto-loading from somewhere
└── 🚨 Could be rendered in parallel with homepage
```

---

## 🔍 Potential Conflict Sources

### 1. 🎭 Dual Authentication Systems
```
NextAuth (Web)          Mobile Auth (localStorage)
├── useSession()   VS   ├── useMobileAuth()
├── session.user        ├── mobile_auth_user
└── Persists data       └── Persists data
    🚨 Both might be active simultaneously
```

### 2. 📱 Layout Wrappers
```
app/layout.tsx
├── ConditionalLayout component
├── Dynamically imports MobileLayout
├── 🚨 Might render multiple components
└── Could cause component overlap

mobile-android/shared/components/MobileLayout.tsx  
├── BottomNavigation component
├── 🚨 Could trigger navigation logic
└── Might auto-navigate to dashboard
```

### 3. 🛣️ Navigation Logic
```
BottomNavigation.tsx
├── useShouldShowNavigation()
├── navigationItems array
├── 🚨 Might auto-redirect
└── Could show dashboard by default

BackButton components
├── Various pages link to /mobile/dashboard
├── 🚨 Might trigger unintended navigation
└── Could cause routing conflicts
```

### 4. 💾 State Persistence
```
localStorage
├── mobile_auth_user (cleared on homepage)
├── session data (NextAuth)
├── 🚨 Service Worker cache
└── Browser cache

Service Worker (public/sw.js)
├── CACHE_NAME: 'jerk-tracker-v1.0.1'
├── Caches dashboard routes
├── 🚨 Might serve cached dashboard
└── Could override homepage
```

---

## 🎯 Quick Action Button Flow

```
Homepage Quick Actions
├── "Launch Dashboard" button
├── "Get Started" button  
└── "View Pricing" button
    │
    📱 User Clicks Button
    ├── 🚨 Glitch occurs
    ├── Homepage visible underneath
    ├── Dashboard appears on top
    └── Suggests overlay/z-index issue
```

---

## 🔧 Debugging Strategy

### Phase 1: Component Isolation
- [ ] Remove MobileLayout wrapper temporarily  
- [ ] Test if homepage loads clean
- [ ] Check if dashboard still appears

### Phase 2: Authentication Cleanup
- [ ] Disable NextAuth completely on mobile
- [ ] Remove all localStorage checks
- [ ] Test with pure static content

### Phase 3: Cache & Service Worker
- [ ] Disable service worker
- [ ] Clear all browser cache
- [ ] Test fresh mobile load

### Phase 4: CSS & Z-Index
- [ ] Check for absolute positioning
- [ ] Look for overlay CSS conflicts
- [ ] Test with simplified styling

---

## 🚨 Most Likely Culprits

1. **Service Worker Caching** - Serving cached dashboard over homepage
2. **NextAuth Session State** - Auto-redirecting authenticated users
3. **Component Overlap** - Dashboard rendering parallel to homepage
4. **MobileLayout Logic** - Auto-navigation in layout wrapper
5. **CSS Z-Index Conflict** - Dashboard positioned over homepage

---

## 📝 Next Steps

1. **Identify the exact render source** of "Welcome back!" dashboard
2. **Trace component mounting order** using React DevTools  
3. **Check network requests** for unwanted dashboard loads
4. **Isolate the mobile page** from all wrappers and providers
5. **Find the hidden redirect/overlay mechanism**

The dashboard is definitely loading from somewhere - we need to find what's triggering it to render over the homepage!