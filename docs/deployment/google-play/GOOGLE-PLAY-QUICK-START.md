# 🚀 Google Play Upload - Quick Start Guide

**Ready to upload in 5 steps!**

---

## ⚡ STEP 1: Build Signed Release (Required)

### Create Keystore (First Time Only)
```bash
cd android/app
keytool -genkey -v -keystore jerktracker-release.keystore -alias jerktracker -keyalg RSA -keysize 2048 -validity 10000
```

**Save these details securely:**
- Keystore password: [YOUR_PASSWORD]
- Key alias: jerktracker
- Key password: [YOUR_KEY_PASSWORD]

### Configure Signing in `android/app/build.gradle`
Add above `buildTypes`:
```gradle
signingConfigs {
    release {
        storeFile file('jerktracker-release.keystore')
        storePassword 'YOUR_KEYSTORE_PASSWORD'
        keyAlias 'jerktracker'
        keyPassword 'YOUR_KEY_PASSWORD'
    }
}
```

Update release buildType:
```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### Build Release AAB
```bash
cd android
./gradlew bundleRelease
```

**Output**: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📸 STEP 2: Create Required Graphics

### A. Store Icon (512x512 PNG)
- Export your app icon as 512x512 PNG
- Must have transparency
- 32-bit PNG format
- Source: Use your existing logo/icon

### B. Feature Graphic (1024x500 PNG/JPG)
- Create horizontal banner
- Show app name: "JERK Tracker X"
- App tagline: "Restaurant Order Tracking"
- No transparency needed
- Eye-catching design

### C. Screenshots (Minimum 2)
Take screenshots on Android device:

1. **Dashboard View** (main screen)
2. **Order List** (orders page)
3. **QR Code Display** (QR generation)
4. **Order Form** (create order)
5. **Settings** (configuration)

**Requirements**:
- Minimum 320px on any side
- Maximum 3840px on any side
- PNG or JPG format
- At least 2 screenshots required

**How to capture**:
1. Run app on Android device: `npm run android:run`
2. Use device screenshot function (Power + Volume Down)
3. Transfer screenshots to computer

---

## 🌐 STEP 3: Google Play Console Setup

### Create Developer Account
1. Go to: https://play.google.com/console
2. Click "Create Account"
3. Pay $25 one-time registration fee
4. Verify email and phone

### Create New App
1. Click "Create App"
2. Fill in:
   - **App Name**: The JERK Tracker X
   - **Default Language**: English (US)
   - **App or Game**: App
   - **Free or Paid**: Free

---

## 📝 STEP 4: Complete Store Listing

### Main Store Listing Section

#### 1. App Details
- **Title**: The JERK Tracker X
- **Short Description**: 
  ```
  Restaurant order tracking with QR codes for pickup coordination
  ```
- **Full Description**: (Copy from `GOOGLE-PLAY-LEGAL-LINKS.md`)

#### 2. Graphic Assets
- Upload 512x512 icon
- Upload 1024x500 feature graphic
- Upload 2-8 screenshots

#### 3. Categorization
- **App Category**: Food & Drink
- **Tags**: restaurant, food, tracking, orders, QR code

#### 4. Contact Details
- **Email**: your-email@domain.com
- **Phone**: (optional)
- **Website**: https://paintbrushmarketing.net/jerktracker/

#### 5. Privacy Policy
- **URL**: https://paintbrushmarketing.net/jerktracker/

---

## 🔒 STEP 5: Complete Required Sections

### A. Content Rating
1. Click "Start Questionnaire"
2. Answer questions honestly:
   - App category: Utility
   - Violence: None
   - Sexual content: None
   - Profanity: None
3. Submit and receive rating

### B. Data Safety
1. **Does your app collect user data?** Yes
   - Email address (for account creation)
   - Name (for orders)
   - Phone number (optional, for orders)

2. **How is data used?**
   - App functionality
   - Account management

3. **Is data shared?** No

4. **Security practices:**
   - Data encrypted in transit (HTTPS)
   - Data encrypted at rest (DynamoDB)
   - Users can request deletion

5. **Privacy Policy**: https://paintbrushmarketing.net/jerktracker/

### C. Pricing & Distribution
1. **Countries**: Select all or specific countries
2. **Price**: Free
3. **Contains Ads**: No
4. **Content Guidelines**: Accept
5. **US Export Laws**: Accept

### D. App Content
1. **Target Audience**: 18+ (Business app)
2. **News App**: No
3. **COVID-19 Contact Tracing**: No
4. **Data Safety**: Already completed
5. **Government App**: No

---

## 📤 STEP 6: Upload & Submit

### Production Release
1. Go to "Production" in left menu
2. Click "Create new release"
3. Upload `app-release.aab` file
4. Wait for processing (2-5 minutes)
5. Add Release Notes:
   ```
   Initial release of The JERK Tracker X
   
   Features:
   - Restaurant order management
   - QR code generation and scanning
   - Real-time order tracking
   - Multi-user role support
   - Offline capability
   ```
6. Save and Review Release

### Final Review
1. Check all sections have green checkmarks
2. Fix any warnings or errors
3. Click "Send X versions to review"

---

## ⏱️ TIMELINE EXPECTATIONS

- **App Review**: 1-7 days (typically 2-3 days)
- **First Response**: 24-48 hours
- **Updates After Approval**: 1-3 hours processing

---

## ✅ PRE-SUBMISSION CHECKLIST

Before clicking "Submit":

- [ ] AAB file built and signed
- [ ] Tested on real Android device
- [ ] All graphics created and uploaded
- [ ] Store listing complete
- [ ] Content rating received
- [ ] Data safety completed
- [ ] Privacy policy link working
- [ ] Pricing & distribution set
- [ ] Release notes written
- [ ] No red warnings in console

---

## 🆘 COMMON ISSUES & SOLUTIONS

### Issue 1: Build Failed
**Solution**: Ensure Android SDK is updated
```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

### Issue 2: Missing Permissions
**Solution**: Already added to AndroidManifest.xml ✅

### Issue 3: Screenshots Too Large
**Solution**: Resize to 1080x1920 or 1440x2560

### Issue 4: Privacy Policy Not Loading
**Solution**: Verify URL is accessible: https://paintbrushmarketing.net/jerktracker/

### Issue 5: AAB Upload Fails
**Solution**: Ensure version code increments each upload

---

## 📞 QUICK REFERENCE

### Important Files
- **AAB Output**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Keystore**: `android/app/jerktracker-release.keystore`
- **Build Config**: `android/app/build.gradle`
- **App Config**: `capacitor.config.ts`
- **Permissions**: `android/app/src/main/AndroidManifest.xml`

### Important Links
- **Google Play Console**: https://play.google.com/console
- **Privacy Policy**: https://paintbrushmarketing.net/jerktracker/
- **Launch Checklist**: https://developer.android.com/distribute/best-practices/launch

### Build Commands
```bash
# Sync with latest web build
npm run android:sync

# Build release AAB
cd android && ./gradlew bundleRelease

# Build release APK (for testing)
cd android && ./gradlew assembleRelease
```

---

## 🎉 AFTER APPROVAL

1. **Monitor Reviews**: Check Play Console regularly
2. **Respond to Users**: Reply to feedback
3. **Track Performance**: View analytics and crash reports
4. **Plan Updates**: Schedule regular app improvements
5. **Promote App**: Share on social media, website

---

## 📊 SUCCESS METRICS

After launch, track:
- Downloads per day
- Active users
- Crash-free rate (aim for 99%+)
- Average rating (aim for 4.0+)
- Review sentiment

---

**You're ready! Let's get The JERK Tracker X on Google Play! 🚀**
