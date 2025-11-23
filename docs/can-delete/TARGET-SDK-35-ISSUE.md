# 🎯 TARGET SDK 35 ISSUE - COMPLETE REFERENCE

**App:** The Pre-Work App  
**Current SDK:** Target SDK 34, Compile SDK 34  
**Required by Google:** Target SDK 35 (as of August 31, 2024)  
**Date:** November 5, 2025

---

## 🚨 **THE PROBLEM**

Google Play Console requires all new apps and app updates to target **API level 35 (Android 15)** as of August 31, 2024.

**Error Message in Play Console:**
```
Error: Your app currently targets API level 34 and must target at least API level 35.
```

**Our Situation:**
- ❌ Cannot upgrade to SDK 35
- ✅ Currently using SDK 34
- ⚠️ React Native 0.72.6 is incompatible with Android SDK 35

---

## 🔧 **WHY WE CAN'T UPGRADE TO SDK 35**

### **Technical Limitation:**
React Native **0.72.6** does not support Android SDK 35 (Android 15).

### **Build Error When Attempting SDK 35:**
```
FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':app:processReleaseResources'.
> Android resource linking failed
  ERROR: C:\Users\leroy\AppData\Local\Android\Sdk\platforms\android-35\android.jar: 
  RES_TABLE_TYPE_TYPE entry offsets overlap.
  error: failed to load resources table in APK 
  'C:\Users\leroy\AppData\Local\Android\Sdk\platforms\android-35\android.jar'.
```

### **Root Cause:**
- React Native 0.72.6 uses older Android Gradle Plugin (AGP) version
- Android SDK 35 changed internal resource table structure
- AGP in RN 0.72.6 cannot parse the new SDK 35 resource format
- Build process fails during resource linking

### **What We Tested:**
- ✅ Upgraded `compileSdkVersion` to 35 → **BUILD FAILED**
- ✅ Upgraded `targetSdkVersion` to 35 → **BUILD FAILED**
- ✅ Reverted to SDK 34 → **BUILD SUCCESSFUL**

---

## ✅ **CURRENT SOLUTION: USE INTERNAL TESTING**

### **Best Immediate Option:**

Upload to **Internal Testing** track instead of Production.

**Why This Works:**
- ✅ Internal Testing has more flexible API requirements
- ✅ Google allows SDK 34 for testing tracks
- ✅ Can test app with real users
- ✅ Can promote to Production later (after requesting extension)

### **Steps to Use Internal Testing:**

1. **In Play Console:**
   - Navigate to: **Testing** → **Internal testing**
   - Click **"Create new release"**

2. **Upload AAB:**
   - Upload: `mobile\android\app\build\outputs\bundle\release\app-release.aab`
   - Version: 1.0.1 (versionCode 2)
   - Target SDK: 34 ✅

3. **Add Testers:**
   - Click **"Testers"** tab
   - Create email list: `Initial Testers`
   - Add emails:
     ```
     apps@paintbrushmarketing.net
     [other tester emails]
     ```
   - Save

4. **Release Notes:**
   ```
   Initial Internal Testing Release - Version 1.0.1

   🧪 Testing Build

   This is the first internal testing release for review.

   Key features to test:
   • Project management and task creation
   • Template library functionality
   • Team collaboration features
   • Mobile responsiveness
   • Performance and stability

   Please report any bugs or issues to apps@paintbrushmarketing.net

   Thank you for testing!
   ```

5. **Start Rollout:**
   - Click **"Review release"**
   - Click **"Start rollout to Internal testing"**
   - ✅ App is now available to testers!

---

## 📝 **OPTION 2: REQUEST EXTENSION FROM GOOGLE** ⚠️ **EXPIRED**

### **⚠️ IMPORTANT: Extension Period Ended November 1, 2025**

**UPDATE:** The extension request period for SDK 35 has ended as of **November 1, 2025**. This option is no longer available.

### **~~How to Request SDK 35 Extension:~~** (NO LONGER AVAILABLE)

~~Google may grant extensions for apps that cannot upgrade to SDK 35 due to technical limitations.~~

### **Method 1: Through Release Page**

1. In Play Console, go to: **Testing** → **Internal testing** or **Release** → **Production**
2. Try to create a release with SDK 34 AAB
3. Look for API 35 error message
4. Click **"Learn more"** link in the error
5. Follow instructions to request extension

### **Method 2: Through Dashboard**

1. Go to **Dashboard** in Play Console
2. Look for **"Publishing overview"** section
3. Check for API 35 requirement notification
4. Click notification to expand
5. Look for **"Request extension"** or **"Learn more"** option

### **Method 3: Contact Support Directly**

1. In Play Console, click **"?"** (Help icon) in top-right corner
2. Select **"Contact us"**
3. Choose category: **"Policy and copyright"** or **"Technical issues"**
4. Use this template message:

```
Subject: Request for Target SDK 35 Extension - Technical Limitation

App Name: The Pre-Work App
Package ID: com.preworkapp
Current Target SDK: 34

Hello Google Play Support Team,

I am requesting an extension for the Target SDK 35 requirement due to a technical limitation.

SITUATION:
Our app is built with React Native 0.72.6, which is currently incompatible with Android SDK 35 (Android 15). When we attempt to compile with SDK 35, we receive a build failure:

"Android resource linking failed - RES_TABLE_TYPE_TYPE entry offsets overlap. Failed to load resources table in APK android-35\android.jar"

This is a known limitation of React Native 0.72.6, as it uses an older Android Gradle Plugin that cannot parse the new SDK 35 resource table structure.

OUR PLAN:
1. Short-term: Release with Target SDK 34 to meet market demand
2. Long-term: Upgrade to React Native 0.75+ (which supports SDK 35) in version 2.0

JUSTIFICATION:
- Target SDK 34 supports 99%+ of Android devices
- No security or compatibility issues with SDK 34
- Upgrading React Native major version requires 2-4 weeks of testing
- Current version is stable and ready for users

REQUEST:
Please grant a temporary extension to release with Target SDK 34 while we plan the React Native upgrade for our next major version.

Thank you for your consideration.

Best regards,
[Your Name]
Contact: apps@paintbrushmarketing.net
```

5. **Submit** and wait 1-2 business days for response

---

## 🚀 **OPTION 3: UPGRADE REACT NATIVE (LONG-TERM)**

### **To Support SDK 35, We Need:**

Upgrade to **React Native 0.75.0+** (released September 2024)

### **Migration Requirements:**

**Minimum RN Version for SDK 35:** React Native 0.75.0+

**Breaking Changes:**
- New Architecture required (Fabric, TurboModules)
- Updated native modules
- Gradle 8.0+ required
- Java 17+ required (✅ we already have this)
- Updated third-party dependencies

**Estimated Effort:**
- **Time:** 2-4 weeks
- **Risk:** High (major version upgrade)
- **Testing:** Extensive regression testing needed
- **Dependencies:** May need to update or replace some libraries

### **Migration Steps:**

1. **Preparation:**
   - Audit all dependencies for RN 0.75 compatibility
   - Check for deprecated APIs in codebase
   - Create comprehensive test suite

2. **Upgrade:**
   ```bash
   # Upgrade React Native
   npm install react-native@0.75.0
   
   # Upgrade React
   npm install react@18.3.1
   
   # Update Gradle wrapper
   cd android
   ./gradlew wrapper --gradle-version 8.5
   
   # Update build.gradle
   # compileSdkVersion = 35
   # targetSdkVersion = 35
   # buildToolsVersion = "35.0.0"
   ```

3. **Enable New Architecture:**
   - Update `gradle.properties`
   - Update native modules
   - Test thoroughly

4. **Test Everything:**
   - Full regression testing
   - Performance testing
   - Device compatibility testing
   - Test on Android 15 devices

5. **Update Dependencies:**
   - Check each npm package for compatibility
   - Update or replace incompatible libraries

### **Recommendation:**
- ⚠️ **Do NOT attempt this for v1.0.0**
- ✅ Plan for v2.0 release (Q1 2026)
- ✅ Use Internal Testing or Extension for v1.0

---

## 📊 **COMPARISON: ALL OPTIONS**

| Option | Time to Release | Effort | Risk | Recommendation |
|--------|----------------|--------|------|----------------|
| **Internal Testing** | Immediate | Low (5 min) | Low | ⭐⭐⭐⭐⭐ **BEST (ONLY SHORT-TERM)** |
| **~~Request Extension~~** | ~~1-2 days~~ | ~~Low (15 min)~~ | ~~Medium~~ | ❌ **EXPIRED NOV 1** |
| **Upgrade RN** | 2-4 weeks | High | High | ⭐⭐⭐⭐⭐ **REQUIRED FOR PRODUCTION** |

---

## 🎯 **RECOMMENDED ACTION PLAN**

### **Phase 1: IMMEDIATE (Today)**
1. ✅ Upload AAB to **Internal Testing** track
2. ✅ Add testers (apps@paintbrushmarketing.net + others)
3. ✅ Start rollout to Internal testing
4. ✅ Test app thoroughly with real users

### **Phase 2: URGENT (This Week) - START REACT NATIVE UPGRADE**
1. ⚠️ **Extensions are NO LONGER AVAILABLE** (ended Nov 1, 2025)
2. 🚨 Begin React Native 0.75+ upgrade immediately
3. Continue testing in Internal Testing track
4. Fix any bugs found during testing

### **Phase 3: SHORT-TERM (2-4 Weeks) - COMPLETE UPGRADE**
1. Complete React Native 0.75+ upgrade
2. Update to Target SDK 35
3. Build and test with SDK 35
4. Prepare Production release

### **Phase 4: PRODUCTION RELEASE**
1. Upload SDK 35 build to Production track
2. Monitor user feedback and metrics
3. ✅ App now fully compliant with Google Play requirements!

---

## 📱 **DEVICE COMPATIBILITY**

### **Current Setup (SDK 34):**
- **Minimum SDK:** 21 (Android 5.0 Lollipop)
- **Target SDK:** 34 (Android 14)
- **Device Coverage:** 99%+ of active Android devices
- **Latest Android:** Android 15 users can still install (with compatibility mode)

### **Benefits of SDK 34:**
- ✅ Supports all modern Android features needed
- ✅ Compatible with 99%+ devices
- ✅ No security vulnerabilities
- ✅ Stable and well-tested
- ✅ No user-facing limitations

---

## 🔍 **FREQUENTLY ASKED QUESTIONS**

### **Q: Can users on Android 15 install our app with SDK 34?**
**A:** Yes! Android maintains backward compatibility. SDK 34 apps work perfectly on Android 15.

### **Q: Are we missing any features by using SDK 34?**
**A:** No significant features. SDK 35 adds minor enhancements, but SDK 34 has all features users need.

### **Q: Will Google reject our app?**
**A:** No, if you use Internal Testing or get an extension. Internal Testing explicitly allows SDK 34.

### **Q: How long will the extension last?**
**A:** Variable. Typically 3-6 months, giving time to upgrade React Native.

### **Q: Can we upload to Production with SDK 34 later?**
**A:** Yes, if you:
1. Get an extension from Google, OR
2. Upgrade React Native to 0.75+ and build with SDK 35

### **Q: Is this a common problem?**
**A:** Yes! Many React Native apps face this. React Native 0.72 is widely used but doesn't support SDK 35.

---

## 📞 **SUPPORT RESOURCES**

### **React Native Community:**
- RN Upgrade Helper: https://react-native-community.github.io/upgrade-helper/
- RN Discord: https://discord.com/invite/reactnative
- GitHub Issues: https://github.com/facebook/react-native/issues

### **Google Play Support:**
- Help Center: https://support.google.com/googleplay/android-developer
- Contact Support: Play Console → "?" icon → "Contact us"
- Policy Center: https://play.google.com/about/developer-content-policy/

### **Our Team:**
- Developer Email: apps@paintbrushmarketing.net
- Internal Docs: See `FIXING-PLAY-CONSOLE-ERRORS.md`

---

## ✅ **CURRENT STATUS**

**What We Have:**
- ✅ AAB built successfully with SDK 34
- ✅ Version 1.0.1 (versionCode 2)
- ✅ ProGuard/R8 enabled
- ✅ File size: 20.58 MB
- ✅ Signed with release keystore
- ✅ All store listing content ready

**What We Need to Do:**
- 🔄 Upload to Internal Testing (5 minutes)
- 🔄 Add testers
- 🔄 Test app thoroughly
- 🔄 (Optional) Request extension for Production

**Blockers:**
- ❌ Cannot upgrade to SDK 35 without React Native upgrade
- ⏳ Waiting to upload to Play Console

---

## 🎉 **CONCLUSION**

**Bottom Line:**
- We **CANNOT** use SDK 35 with React Native 0.72.6
- We **CAN** release with SDK 34 via Internal Testing (short-term)
- ⚠️ Extensions are **NO LONGER AVAILABLE** (ended Nov 1, 2025)
- We **MUST** upgrade to React Native 0.75+ for Production release

**Next Steps:**
1. Upload to Internal Testing track (immediate)
2. Create backup branch and attempt React Native 0.75+ upgrade (urgent)
3. Complete SDK 35 upgrade for Production release

**Timeline:** Internal Testing buys you time while upgrading React Native (2-4 weeks). 🚀

---

## 💾 **BACKUP STRATEGY FOR REACT NATIVE UPGRADE**

### **Recommended Approach: Git Branch Strategy**

**YES! You should absolutely create a backup before attempting the React Native upgrade.** Here's the safest approach:

### **Option 1: Git Branch (RECOMMENDED)**

```bash
# 1. Ensure current work is committed
git add .
git commit -m "Pre-upgrade checkpoint - RN 0.72.6 SDK 34 working build"

# 2. Create a backup branch (keep current version safe)
git branch backup/rn-0.72.6-sdk34-stable

# 3. Create upgrade branch
git checkout -b upgrade/rn-0.75-sdk35

# 4. Push both branches to remote (extra safety)
git push origin backup/rn-0.72.6-sdk34-stable
git push origin upgrade/rn-0.75-sdk35

# Now you can safely experiment on upgrade/rn-0.75-sdk35 branch
```

**Benefits:**
- ✅ No disk space wasted (Git is efficient)
- ✅ Easy to switch between versions: `git checkout backup/rn-0.72.6-sdk34-stable`
- ✅ Can cherry-pick bug fixes between branches
- ✅ Full version history maintained
- ✅ Can merge successful changes back to master

### **Option 2: Complete Project Backup (Also Good)**

```bash
# Create a complete copy of the project folder
# In PowerShell:
Copy-Item -Path "thejerktrackerX" -Destination "thejerktrackerX-backup-rn072" -Recurse

# Or compress it to save space:
Compress-Archive -Path "thejerktrackerX" -DestinationPath "thejerktrackerX-backup-rn072-$(Get-Date -Format 'yyyyMMdd').zip"
```

**Benefits:**
- ✅ Completely independent copy
- ✅ Can work on both simultaneously
- ✅ Zero risk to original project
- ❌ Takes more disk space (~100-500 MB)
- ❌ Harder to sync bug fixes between versions

### **Option 3: Hybrid Approach (BEST)**

Use both Git branches AND a compressed backup:

```bash
# 1. Git branch for version control
git checkout -b backup/rn-0.72.6-sdk34-stable
git push origin backup/rn-0.72.6-sdk34-stable

# 2. Compressed backup for extra safety
Compress-Archive -Path "." -DestinationPath "../thejerktrackerX-backup-$(Get-Date -Format 'yyyyMMdd').zip"

# 3. Work on upgrade branch
git checkout -b upgrade/rn-0.75-sdk35
```

---

## 🔧 **STEP-BY-STEP: SAFE REACT NATIVE 0.75 UPGRADE PROCESS**

### **Phase 1: Preparation (30 minutes)**

1. **Create Backups** (use Hybrid Approach above)

2. **Document Current State:**
   ```bash
   # Record all package versions
   npm list --depth=0 > pre-upgrade-packages.txt
   
   # Record current build configuration
   Copy-Item android/build.gradle android/build.gradle.backup
   Copy-Item android/app/build.gradle android/app/build.gradle.backup
   ```

3. **Check Dependency Compatibility:**
   - Visit: https://react-native-community.github.io/upgrade-helper/?from=0.72.6&to=0.75.0
   - Review breaking changes
   - Check each npm package for RN 0.75 compatibility

### **Phase 2: Upgrade Execution (2-4 hours)**

1. **Upgrade React Native:**
   ```bash
   # Install React Native Upgrade Helper
   npm install -g react-native-upgrade-helper
   
   # Upgrade React Native
   npm install react-native@0.75.0
   npm install react@18.3.1
   
   # Update related packages
   npm install @react-native-community/cli@latest
   npm install metro@latest metro-resolver@latest
   ```

2. **Update Android Configuration:**
   ```bash
   # Update Gradle wrapper
   cd android
   ./gradlew wrapper --gradle-version 8.5
   cd ..
   ```

3. **Update `android/build.gradle`:**
   ```gradle
   buildscript {
       ext {
           buildToolsVersion = "34.0.0"
           minSdkVersion = 21
           compileSdkVersion = 35
           targetSdkVersion = 35
           ndkVersion = "26.1.10909125"
       }
       dependencies {
           classpath("com.android.tools.build:gradle:8.3.0")
       }
   }
   ```

4. **Enable New Architecture (if needed):**
   
   Edit `android/gradle.properties`:
   ```properties
   newArchEnabled=true
   ```

5. **Update Dependencies:**
   ```bash
   # Check for outdated packages
   npm outdated
   
   # Update compatible packages
   npm update
   ```

### **Phase 3: Build and Test (1-2 days)**

1. **Clean Build:**
   ```bash
   # Clean everything
   cd android
   ./gradlew clean
   cd ..
   
   # Clear caches
   npm start -- --reset-cache
   
   # Rebuild
   cd android
   ./gradlew assembleRelease
   ```

2. **Test Incrementally:**
   - Build debug version first
   - Test on emulator
   - Test on physical device
   - Build release version
   - Test all features thoroughly

3. **Document Issues:**
   - Create a log of any errors encountered
   - Document fixes applied
   - Track time spent

### **Phase 4: Rollback Plan (If Needed)**

If upgrade fails or takes too long:

```bash
# Option A: Switch back to backup branch
git checkout backup/rn-0.72.6-sdk34-stable

# Option B: Restore from folder backup
# Delete failed upgrade and restore backup

# Option C: Continue with Internal Testing on SDK 34
# while planning a more gradual upgrade path
```

---

## ⏱️ **REALISTIC TIMELINE**

### **Optimistic Scenario (2 weeks):**
- Week 1: Upgrade and initial testing
- Week 2: Bug fixes and production preparation
- ✅ Production release with SDK 35

### **Realistic Scenario (3-4 weeks):**
- Week 1: Upgrade, resolve breaking changes
- Week 2: Fix compatibility issues, update dependencies
- Week 3: Extensive testing, bug fixes
- Week 4: Final testing, production release

### **Pessimistic Scenario (6-8 weeks):**
- Weeks 1-2: Upgrade attempts, multiple blockers
- Weeks 3-4: Replace incompatible dependencies
- Weeks 5-6: Extensive refactoring needed
- Weeks 7-8: Complete testing and release

---

## ⚠️ **RISK ASSESSMENT**

### **High Risk Factors:**
- Multiple third-party native modules
- Custom native code modifications
- Heavily customized build configuration
- Dependencies not yet updated for RN 0.75

### **Medium Risk Factors:**
- Breaking changes in React Navigation
- Changes in async storage or other core libraries
- Performance regressions
- New bugs in RN 0.75 (it's relatively new)

### **Mitigation Strategies:**
- ✅ Use Git branches for safe experimentation
- ✅ Test on multiple devices/Android versions
- ✅ Keep Internal Testing running with SDK 34
- ✅ Budget 4 weeks instead of 2 weeks
- ✅ Have rollback plan ready

---

## 🎯 **RECOMMENDATION**

**YES - Create backup and attempt upgrade, BUT:**

1. **Do it on a separate Git branch** (not the master branch)
2. **Keep Internal Testing running** with SDK 34 build
3. **Set realistic timeline:** 3-4 weeks minimum
4. **Be prepared to rollback** if major blockers appear
5. **Document everything** for future reference

**Parallel Strategy:**
- **Track 1 (Immediate):** Upload SDK 34 to Internal Testing → get feedback
- **Track 2 (Concurrent):** Attempt RN 0.75 upgrade on separate branch
- **Decision Point (Week 2):** Assess upgrade progress, decide to continue or postpone

This gives you the best of both worlds: users can test your app now, while you work on the upgrade safely! 🚀

---

**Created:** November 5, 2025  
**Last Updated:** November 5, 2025  
**Current React Native Version:** 0.72.6  
**Current Target SDK:** 34  
**Required Target SDK:** 35  
**Status:** Workaround documented, ready to proceed with Internal Testing
