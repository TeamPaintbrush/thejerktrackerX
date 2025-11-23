# Test Setup Summary

## ✅ What's Been Configured:

### 1. **Test Locations** (3 locations auto-created)
All test users now have `businessId: 'test-business-001'` which links to these locations:

#### Downtown Kingston
- **Address**: 123 King Street, Kingston, Jamaica
- **Coordinates**: 18.0179, -76.8099
- **Hours**: Mon-Thu 10:00-22:00, Fri-Sat 10:00-23:00, Sun 11:00-21:00
- **Max Orders**: 100/day
- **QR Code**: Auto-generated on creation

#### Montego Bay Branch
- **Address**: 456 Hip Strip Avenue, Montego Bay, Jamaica
- **Coordinates**: 18.4762, -77.8939
- **Hours**: Mon-Thu 09:00-22:00, Fri-Sat 09:00-23:00, Sun 10:00-21:00
- **Max Orders**: 150/day
- **QR Code**: Auto-generated on creation

#### Ocho Rios Location
- **Address**: 789 Beach Boulevard, Ocho Rios, Jamaica
- **Coordinates**: 18.4078, -77.1031
- **Hours**: Mon-Thu 08:00-21:00, Fri-Sat 08:00-22:00, Sun 09:00-20:00
- **Max Orders**: 80/day
- **QR Code**: Auto-generated on creation

### 2. **Test User Accounts** (Updated with businessId)
All test accounts now include `businessId: 'test-business-001'`:

- `admin@jerktrackerx.com` / `admin123` - Admin role
- `manager@jerktrackerx.com` / `manager123` - Manager role
- `driver@jerktrackerx.com` / `driver123` - Driver role
- `customer@jerktrackerx.com` / `customer123` - Customer role

### 3. **Automatic Initialization**
The `MobileOrderCreation` component now automatically:
1. Calls `initializeTestLocations()` on mount
2. Creates 3 test locations if they don't exist
3. Loads locations by businessId
4. Uses GPS to auto-detect nearest location
5. Shows location banner with detection status

### 4. **QR Code System** ✅ Ready
- **Library**: `qrcode.react` (installed)
- **Component**: `QRCodeDisplay.tsx` (ready to use)
- **Generation**: Auto-generates unique QR codes for each order
- **Format**: `qr-{location}-{timestamp}` for primary codes
- **Backup**: Each location has backup QR code

## 🧪 Testing Workflow:

1. **Sign in** with any test account (e.g., `manager@jerktrackerx.com` / `manager123`)
2. **Navigate** to Orders Hub → Create Order
3. **Location Detection**:
   - If GPS enabled: Auto-detects nearest location
   - If single location: Auto-selects it
   - If multiple locations: Shows nearest within 100m radius
4. **Add Menu Items** to cart
5. **Checkout**: Creates order with:
   - Detected location ID
   - Location's QR code
   - GPS coordinates
   - Verification status

## 📍 Location Detection Logic:

```typescript
// Single location → Auto-select (no GPS needed)
if (locations.length === 1) {
  setDetectedLocation(locations[0]);
}

// Multiple locations → GPS detection
else {
  const coords = await getCurrentLocation();
  const nearest = findNearestLocation(coords, locations);
  
  if (distance <= 100m) {
    setDetectedLocation(nearest); // ✅ Verified
  } else {
    showError(`${distance}m away - outside range`); // ⚠️ Too far
  }
}
```

## 🔧 QR Code Generation:

Every order automatically gets:
- **Unique QR Code ID**: `qr-{orderNumber}-{random}`
- **Tracking URL**: `/order?id={orderId}`
- **Display**: `QRCodeCanvas` component
- **Size**: 200x200 (customizable)
- **Download**: Print button included

## 📂 Files Modified:

1. `lib/test-data.ts` - Test location definitions
2. `mobile-android/shared/services/mobileAuth.ts` - Added businessId to test users
3. `mobile-android/shared/components/orders/MobileOrderCreation.tsx` - Auto-init locations
4. `components/QRCodeDisplay.tsx` - QR code rendering (already existed)

## 🚀 Next Steps:

To test the full flow:
1. Build: `.\build-sdk35.ps1`
2. Run in Android Studio
3. Sign in with test account
4. Create order → QR code generated
5. View order details → See QR code
6. Scan QR code → Track order

## 💡 Pro Tips:

- **GPS Testing**: Use Android Emulator location tools to simulate GPS
- **Multiple Locations**: Change emulator location to test auto-detection
- **QR Scanning**: Use `/mobile/qr` page to scan generated codes
- **Location Management**: View/edit locations in Settings → Locations
