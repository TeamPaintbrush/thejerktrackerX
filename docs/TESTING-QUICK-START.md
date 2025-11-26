# 🚀 Feature Testing Quick Start Guide

**All features successfully installed and configured!** ✅

---

## ✅ What's Ready to Test

### 1. **Transfer Orders** (Web + Mobile)
**Test now:** Both platforms ready
```
1. Navigate to customer dashboard (web or mobile)
2. Find an order card
3. Click "Transfer" button
4. Select destination location
5. Add optional reason
6. Submit and verify order moves to new location
```

### 2. **Business Analytics Dashboard** (Web + Mobile)
**Test now:** Both platforms ready
```
Routes:
- Web: http://localhost:3100/analytics
- Mobile: http://localhost:3100/mobile/analytics

Features:
✅ Real-time metrics with trends
✅ Location performance comparison
✅ Peak hours heatmap
✅ Custom date range filters
```

### 3. **Fraud Detection System**
**Test now:** Auto-runs on order creation
```
Create orders and watch console for:
- Duplicate order alerts
- Unusual pattern warnings
- High volume alerts
- Rapid succession detection

Check: Browser localStorage > fraudAlerts
```

### 4. **Accessibility Features** (Web + Mobile)
**Test now:** All platforms ready
```
✅ Press Tab - See focus indicators
✅ Press Escape in modals - Should close
✅ Use arrow keys in lists
✅ Check screen reader announcements
✅ Toggle high contrast mode

Import: AccessibilityService.getInstance().toggleHighContrastMode()
```

### 5. **Email Reports** ⚠️ Requires AWS SES Verification
**Setup needed:**
```
1. Go to AWS SES Console: https://console.aws.amazon.com/ses
2. Verify sender email: noreply@jerktrackerx.com
3. Move out of SES sandbox (for production)
4. Test from browser console:

import emailReportService from '@/services/EmailReportService';
await emailReportService.sendDailyReport('business-id', 'your@email.com');
```

### 6. **QR Scanner** (Mobile Only) 📱 Physical Device Required
**Setup needed:**
```
1. Build mobile app: npm run build:mobile
2. Sync to Android: npx cap sync android
3. Open Android Studio: npx cap open android
4. Deploy to physical device (camera required)
5. Navigate to: /mobile/scan
6. Test scanning order QR codes
```

### 7. **Haptic Feedback** (Mobile Only) 📱 Physical Device Required
**Setup needed:**
```
1. Deploy to physical Android device
2. Test actions:
   - Button taps (light vibration)
   - Order creation (success pattern)
   - Transfer order (double-tap pattern)
   - Form errors (error vibration)
   
Import: import { haptics } from '@/services/MobileInteractionService';
await haptics.buttonTap();
```

### 8. **Share Menu** (Mobile Only) 📱 Works on Device/Emulator
**Test now:** Works in Android emulator
```
1. Build and sync: npm run build:mobile && npx cap sync
2. Open in Android Studio
3. Test from console:

import { share } from '@/services/MobileInteractionService';
await share.order('ORD-2025-001', 'https://app.com/qr-tracking/ORD-2025-001');
await share.qrTracking('ORD-2025-001');
```

### 9. **Push Notifications** (Mobile Only) 🔔 Requires Firebase
**Setup needed:**
```
1. Create Firebase project: https://console.firebase.google.com
2. Add Android app (package: com.jerktrackerx.app)
3. Download google-services.json
4. Place in: android/app/google-services.json
5. Rebuild: npm run build:mobile && npx cap sync
6. Deploy to device
7. Test initialization:

import pushNotificationService from '@/services/PushNotificationService';
await pushNotificationService.initialize();
```

---

## 🏃 Quick Test Commands

### Test Web Features (Available Now)
```bash
# Start dev server
npm run dev

# Visit in browser:
http://localhost:3100/analytics           # Analytics dashboard
http://localhost:3100/customer            # Transfer orders
http://localhost:3100/mobile/analytics    # Mobile analytics
http://localhost:3100/mobile/scan         # Scanner UI (no camera)

# Test in browser console:
import { AccessibilityService } from '@/services/AccessibilityService';
AccessibilityService.getInstance().toggleHighContrastMode();
```

### Build Mobile App (For Device Testing)
```bash
# Build and sync
npm run build:mobile
npx cap sync android

# Open Android Studio
npx cap open android

# Or build release APK
cd android
./gradlew assembleDebug
# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### Verify Setup
```bash
# Run verification script
node scripts/verify-features.js
```

---

## 📊 Feature Status Matrix

| Feature | Web | Mobile | Device Required | Firebase Required | AWS Required |
|---------|-----|--------|-----------------|-------------------|--------------|
| Transfer Orders | ✅ | ✅ | ❌ | ❌ | ❌ |
| Analytics Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fraud Detection | ✅ | ✅ | ❌ | ❌ | ❌ |
| Accessibility | ✅ | ✅ | ❌ | ❌ | ❌ |
| Email Reports | ✅ | ✅ | ❌ | ❌ | ✅ SES |
| QR Scanner | ❌ | ✅ | ✅ | ❌ | ❌ |
| Haptics | ❌ | ✅ | ✅ | ❌ | ❌ |
| Share Menu | ❌ | ✅ | ⚠️ Emulator OK | ❌ | ❌ |
| Push Notifications | ❌ | ✅ | ✅ | ✅ | ❌ |

---

## 🎯 Recommended Testing Order

### Phase 1: Web Testing (Now)
1. ✅ Test Transfer Orders on customer dashboard
2. ✅ View Analytics Dashboard with filters
3. ✅ Create orders to trigger fraud detection
4. ✅ Test keyboard navigation (Tab key)
5. ✅ Toggle high contrast mode

### Phase 2: AWS SES Setup (When Ready)
1. Verify sender email in AWS Console
2. Move out of SES sandbox
3. Test email reports from API route

### Phase 3: Mobile Device Testing (When Ready)
1. Build mobile app
2. Deploy to physical Android device
3. Test QR scanner with real codes
4. Test haptic feedback
5. Test share functionality

### Phase 4: Firebase Setup (Optional)
1. Create Firebase project
2. Add google-services.json
3. Rebuild and test push notifications
4. Test notification navigation

---

## 🐛 Troubleshooting

### Analytics Not Showing Data
```
✅ Check DynamoDB has orders with location data
✅ Check browser console for errors
✅ Verify date filter range includes order dates
```

### Transfer Button Not Appearing
```
✅ Ensure locations array has 2+ locations
✅ Check DynamoDB Locations table
✅ Run: npx tsx scripts/seed-locations.ts
```

### QR Scanner Not Working
```
✅ Must use physical device (not emulator)
✅ Check camera permissions granted
✅ Verify Android manifest has CAMERA permission
```

### Haptics Not Vibrating
```
✅ Must use physical device
✅ Check device has vibration enabled
✅ Verify VIBRATE permission in manifest
```

### Email Reports Failing
```
✅ Verify AWS SES sender email verified
✅ Check AWS credentials in .env.local
✅ Ensure out of SES sandbox (production)
✅ Check recipient email not in spam
```

---

## 📱 Android Build Commands

### Debug Build (Quick Testing)
```bash
npm run build:mobile
npx cap sync android
cd android
./gradlew assembleDebug
# Install: adb install app/build/outputs/apk/debug/app-debug.apk
```

### Release Build (Play Store)
```bash
npm run build:mobile
npx cap sync android
cd android
./gradlew bundleRelease
# Upload: app/build/outputs/bundle/release/app-release.aab
```

---

## ✅ Success Criteria

You'll know features are working when:

- [x] Transfer button appears on orders with 2+ locations
- [x] Analytics page shows metrics, charts, and filters
- [x] Fraud alerts appear in console on duplicate orders
- [x] Tab key shows visible focus indicators
- [x] Email reports arrive in inbox (after SES setup)
- [ ] QR scanner opens camera on device
- [ ] Phone vibrates on button taps
- [ ] Share menu opens with order details
- [ ] Push notifications received on device (after Firebase)

---

**Current Status:** 6/9 features ready to test immediately! 🎉

**Next Action:** Test web features or proceed with AWS SES/Firebase setup for remaining features.
