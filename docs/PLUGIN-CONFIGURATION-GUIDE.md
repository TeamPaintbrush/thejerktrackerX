# 📱 Capacitor Plugins Configuration Guide

**Status:** ✅ All plugins installed and synced

## Installed Plugins

| Plugin | Version | Status | Purpose |
|--------|---------|--------|---------|
| @capacitor/push-notifications | 7.0.3 | ✅ Installed | FCM push notifications |
| @capacitor/share | 7.0.2 | ✅ Installed | Native share menu |
| @capacitor/haptics | 7.0.2 | ✅ Installed | Vibration feedback |
| @capacitor/barcode-scanner | 2.2.0 | ✅ Installed | QR code scanning |
| @aws-sdk/client-ses | Latest | ✅ Installed | Email reports |

---

## 🔧 Configuration Steps

### 1. AWS SES Email Reports

**Add to `.env.local`:**
```bash
# AWS SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
NEXT_PUBLIC_SENDER_EMAIL=noreply@jerktrackerx.com
```

**AWS Console Steps:**
1. Go to AWS SES Console
2. Verify your sender email domain
3. Move out of sandbox for production sending
4. Create IAM user with SES send permissions
5. Generate access keys

---

### 2. Push Notifications (Firebase FCM)

**Files to configure:**
- `android/app/google-services.json` - Add from Firebase Console

**Firebase Console Steps:**
1. Create Firebase project at https://console.firebase.google.com
2. Add Android app with package name: `com.jerktrackerx.app`
3. Download `google-services.json`
4. Place in `android/app/google-services.json`
5. Get FCM Server Key from Project Settings > Cloud Messaging

**Backend API Endpoint Required:**
```typescript
// Create: app/api/notifications/register-token/route.ts
export async function POST(request: Request) {
  const { userId, fcmToken } = await request.json();
  // Store token in DynamoDB Users table
  await DynamoDBService.updateUser(userId, { fcmToken });
  return Response.json({ success: true });
}
```

---

### 3. Android Permissions

**Verify in `android/app/src/main/AndroidManifest.xml`:**
```xml
<manifest>
    <!-- Camera for QR scanning -->
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- Haptic feedback -->
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <!-- Push notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Internet for API calls -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Geolocation (already configured) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
</manifest>
```

---

### 4. Test Features

**QR Scanner:**
- Must test on physical device (camera required)
- Emulator won't work
- Test with order QR codes

**Haptic Feedback:**
- Must test on physical device
- Emulator won't vibrate
- Test button taps, success/error notifications

**Push Notifications:**
- Must configure Firebase first
- Test on physical device
- Test foreground and background notifications

**Share Menu:**
- Works on physical device and emulator
- Test sharing orders, QR codes, analytics

**Email Reports:**
- Test from backend API route
- Verify AWS SES credentials
- Check spam folders initially

---

## 🚀 Usage Examples

### QR Scanner
```typescript
import qrScannerService from '@/services/QRScannerService';
import { useRouter } from 'next/navigation';

const router = useRouter();
await qrScannerService.scanAndNavigate(router);
```

### Haptics
```typescript
import { haptics } from '@/services/MobileInteractionService';

await haptics.buttonTap();      // Light vibration
await haptics.success();        // Success pattern
await haptics.orderCreated();   // Custom semantic action
```

### Share
```typescript
import { share } from '@/services/MobileInteractionService';

await share.order('ORD-2025-001', 'https://app.com/qr-tracking/ORD-2025-001');
await share.qrTracking('ORD-2025-001');
```

### Push Notifications
```typescript
import pushNotificationService from '@/services/PushNotificationService';

// Initialize on app startup
await pushNotificationService.initialize();

// Get token
const token = pushNotificationService.getToken();

// Register with backend
await fetch('/api/notifications/register-token', {
  method: 'POST',
  body: JSON.stringify({ userId, fcmToken: token })
});
```

### Email Reports
```typescript
import emailReportService from '@/services/EmailReportService';

await emailReportService.sendDailyReport('business-id', 'manager@email.com');
await emailReportService.sendWeeklyReport('business-id', 'manager@email.com');
```

---

## 🧪 Testing Checklist

- [ ] **AWS SES Setup:**
  - [ ] Email domain verified
  - [ ] IAM credentials created
  - [ ] Test email sent successfully

- [ ] **Firebase FCM Setup:**
  - [ ] Project created
  - [ ] `google-services.json` added
  - [ ] Test notification received

- [ ] **Android Build:**
  - [ ] Permissions added to manifest
  - [ ] App builds successfully
  - [ ] No permission errors at runtime

- [ ] **Feature Testing:**
  - [ ] QR scanner opens camera
  - [ ] QR codes scan and navigate correctly
  - [ ] Haptic feedback vibrates on actions
  - [ ] Share menu opens with correct content
  - [ ] Push notifications received
  - [ ] Email reports sent and received

---

## 📝 Notes

- **QR Scanner:** Uses `@capacitor/barcode-scanner@2.2.0` which is compatible with Capacitor 7
- **Platform Detection:** All services check `Capacitor.isNativePlatform()` before using plugins
- **Error Handling:** Services gracefully handle missing permissions or unsupported platforms
- **Dev Mode:** Services log to console for debugging

---

## 🔗 Plugin Documentation

- [Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Share](https://capacitorjs.com/docs/apis/share)
- [Haptics](https://capacitorjs.com/docs/apis/haptics)
- [Barcode Scanner](https://github.com/capacitor-community/barcode-scanner)
- [AWS SES](https://docs.aws.amazon.com/ses/latest/dg/send-email-sdk.html)

---

**Last Updated:** November 25, 2025  
**Sync Status:** ✅ All plugins synced with Android project
