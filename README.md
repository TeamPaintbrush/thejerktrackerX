# The JERK Tracker X

A modern restaurant order tracking app built with Next.js, Styled Components, and AWS DynamoDB with native Android mobile app support via Capacitor.

## Features

### 📱 Mobile App (Android)
- **Native Mobile App**: Android app built with Capacitor
- **Bottom Navigation**: 4-icon navigation bar (Dashboard, Orders, QR Code, Settings)
- **Role-Based Mobile Dashboards**: Separate dashboards for Admin, Manager, Driver, and Customer
- **Mobile Authentication**: Secure mobile-specific auth flow with role-based routing
- **Offline Support**: Service Worker disabled to prevent dashboard overlay issues
- **Mobile-First Design**: Optimized layouts for mobile screens with safe area support

### 🖥️ Web App
- **Order Management**: Create, track, and manage restaurant orders
- **Admin Dashboard**: View all orders, generate QR codes, manage order status (protected route)
- **Customer Dashboard**: Restored full customer dashboard with order management
- **Comprehensive Settings**: Restaurant info, order configuration, notifications, user profiles, and system preferences
- **User Authentication**: Secure login/signup system with role-based access (Administrator default)
- **Cloud Persistence**: Orders and users stored in AWS DynamoDB for multi-user access
- **Responsive Design**: Modern UI with Styled Components and Framer Motion
- **Static Export**: Optimized static build for fast loading

## Getting Started

### Web App - Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)
5. Admin dashboard: [http://localhost:3000/admin](http://localhost:3000)

### Mobile App - Android Development

1. Build the Next.js app:
   ```bash
   npm run build
   ```
2. Sync with Capacitor:
   ```bash
   npx cap sync android
   ```
3. Open in Android Studio:
   ```bash
   npx cap open android
   ```
4. Run on emulator or device via Android Studio

**Note**: Gradle requires Java 17. If build fails, open Android Studio and use the built-in Gradle build system.

### Deployment

The app now uses dynamic routes for authentication and should be deployed to platforms that support server-side rendering:

#### Recommended Platforms
- **Vercel**: `vercel --prod`
- **Netlify**: With Next.js build settings
- **Railway**: `railway deploy`
- **AWS Amplify**: With Next.js configuration

#### Environment Variables
Set these environment variables in your deployment platform:
```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.com
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
```

**Note**: GitHub Pages deployment is no longer supported due to authentication requirements.

## Architecture

- **Frontend**: Next.js 15.5.4 with App Router
- **Mobile**: Capacitor Android app with native mobile components
- **Authentication**: NextAuth.js v5 with credentials provider + Mobile-specific auth service
- **Styling**: Styled Components with theme system
- **Storage**: AWS DynamoDB for orders and users, with localStorage fallback
- **Security**: bcrypt password hashing, JWT sessions
- **Deployment**: Static export for web, Android APK for mobile

## Key Components

### Mobile-Specific
- `mobile-android/shared/components/BottomNavigation.tsx` - 4-icon bottom navigation (Capacitor-only)
- `mobile-android/shared/components/MobileLayout.tsx` - Mobile page wrapper with safe areas
- `mobile-android/shared/services/mobileAuth.ts` - Mobile authentication and role-based routing
- `app/mobile/layout.tsx` - Mobile pages layout with bottom navigation
- `app/mobile/dashboard/page.tsx` - Role-based mobile dashboard (5.26 kB)

### Web-Specific
- `app/customer/page.tsx` - Web customer dashboard (4.34 kB)
- `app/admin/page.tsx` - Web admin dashboard
- `components/OrderList.tsx` - Web order management
- `components/Header.tsx` - Web navigation header

## Authentication

The app includes complete authentication for both web and mobile:

### User Roles
- **Administrator**: Full access to admin dashboard and order management (default signup role)
- **Manager**: Order management access
- **Driver**: Delivery and order pickup
- **Customer**: Order placement and tracking

### Default Admin Account
For testing purposes, use these credentials:
- **Email**: admin@thejerktracker.com
- **Password**: admin123

### Authentication Features
- Secure password hashing with bcrypt
- JWT-based sessions (web)
- localStorage-based sessions (mobile)
- Role-based access control
- Protected admin routes
- User registration and login (Administrator default)
- Mobile-specific routing based on role:
  - Admin → `/mobile/dashboard`
  - Manager/Driver → `/mobile/orders`
  - Customer → `/mobile/dashboard`

### Testing Authentication

#### Web App
1. Visit the sign-in page: [http://localhost:3000/auth/signin](http://localhost:3000/auth/signin)
2. Use the admin credentials above
3. Access the protected admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

#### Mobile App
1. Launch app on Android device/emulator
2. Sign in with admin credentials
3. Navigate using bottom navigation (Dashboard, Orders, QR, Settings)

## Documentation

📚 **Complete documentation is now organized in the [docs/](./docs/) folder with a clear hierarchy:**

### 🎯 Documentation Hub
**Start here:** [docs/README.md](./docs/README.md) - Complete documentation navigation with organized sections

### Quick Access Guides
- **[Quick Reference](./docs/QUICK-REFERENCE.md)** - 🚀 Developer quick start and common tasks
- **[Project Status](./docs/PROJECT-STATUS.md)** - ⭐ Complete project status, architecture, and features
- **[Changelog](./docs/CHANGELOG.md)** - Version history and recent updates
- **[Roadmap](./docs/ROADMAP.md)** - Future development plans

### 📱 Deployment & Testing
- **[Google Play Release Guide](./docs/deployment/google-play/GOOGLE-PLAY-RELEASE-GUIDE.md)** - Production deployment to Android
- **[Upload Troubleshooting](./docs/deployment/google-play/UPLOAD-TROUBLESHOOTING.md)** - Common upload errors and fixes
- **[Test Scenarios](./docs/testing/TEST-SCENARIOS-REPORT.md)** - 72/72 test cases (100% PASS)
- **[Error Resolutions](./docs/testing/ERRORS-FIXED.md)** - Historical bug fixes

### 💻 Development
- **[Mobile Implementation](./docs/development/IMPLEMENTATION-SUMMARY.md)** - Android app development guide
- **[AWS Setup](./docs/setup/AWS-SETUP-GUIDE.md)** - DynamoDB configuration
- **[Settings Components](./docs/SETTINGS-COMPONENTS.md)** - Admin settings system
- **[UI Reference](./docs/ui/UI-REFERENCE.md)** - Design system guidelines

### 🗺️ Planning & Features
- **[Data Dashboard Roadmap](./docs/planning/LATER_ROADMAP.md)** - Future widget enhancements (5 phases)
- **[Features List](./docs/features/FEATURES.md)** - Complete feature inventory
- **[QR Code System](./docs/features/QR-CODE-DRIVER-PICKUP-SYSTEM.md)** - Driver pickup specification
- **[Mobile Features](./docs/features/MOBILE-ENHANCEMENTS.md)** - Mobile-specific capabilities

### 📂 Documentation Structure
```
docs/
├── README.md                        # 📚 Main documentation hub
├── deployment/
│   └── google-play/                 # 📱 11 Google Play release guides
├── testing/                         # 🧪 Test scenarios and error logs
├── development/                     # 💻 Implementation guides
├── planning/                        # 🗺️ Roadmaps and feature planning
├── features/                        # 🎯 Feature specifications
├── setup/                           # 🔧 Configuration guides
├── ui/                              # 🎨 Design system docs
└── archived/                        # 📦 Historical documentation
```

**📊 Stats:** 30+ organized documentation files | 92.5% active usage | Production-ready

## Fixed Issues

✅ **Authentication System**: Complete NextAuth.js v5 implementation with user registration, login, and role-based access  
✅ **Admin Route Protection**: Middleware protecting admin dashboard with authentication and role checks  
✅ **User Management**: DynamoDB integration for user storage with localStorage fallback  
✅ **Session Management**: JWT-based sessions with proper provider setup  
✅ **QR Code Generation**: Fixed basePath handling for GitHub Pages deployment  
✅ **localStorage Access**: Added proper SSR/client-side checks  
✅ **Order Persistence**: Unified localStorage key usage across components  
✅ **Error Handling**: Improved fallback mechanisms for localStorage operations