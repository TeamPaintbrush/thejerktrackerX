#!/usr/bin/env node

/**
 * Feature Setup Verification Script
 * 
 * This script checks that all new features are properly configured:
 * - Capacitor plugins installed
 * - AWS SES credentials configured
 * - Service files created
 * - API endpoints available
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Feature Setup Verification\n');
console.log('='.repeat(50));

let allChecksPass = true;

// Helper function
function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${description}`);
  if (!exists) allChecksPass = false;
  return exists;
}

function checkEnvVar(varName, description) {
  // Check .env.local file
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const exists = envContent.includes(varName);
    console.log(`${exists ? '✅' : '❌'} ${description}`);
    if (!exists) allChecksPass = false;
    return exists;
  }
  return false;
}

// 1. Check Service Files
console.log('\n📦 Service Files:');
checkFile('services/AccessibilityService.ts', 'Accessibility Service');
checkFile('services/QRScannerService.ts', 'QR Scanner Service');
checkFile('services/MobileInteractionService.ts', 'Mobile Interaction Service');
checkFile('services/PushNotificationService.ts', 'Push Notification Service');
checkFile('services/FraudDetectionService.ts', 'Fraud Detection Service');
checkFile('services/EmailReportService.ts', 'Email Report Service');

// 2. Check Component Files
console.log('\n🎨 Components:');
checkFile('components/Analytics/AnalyticsDashboard.tsx', 'Analytics Dashboard');
checkFile('components/TransferOrderModal.tsx', 'Transfer Order Modal');
checkFile('styles/accessibility.css', 'Accessibility Styles');

// 3. Check Page Files
console.log('\n📄 Pages:');
checkFile('app/analytics/page.tsx', 'Web Analytics Page');
checkFile('app/mobile/analytics/page.tsx', 'Mobile Analytics Page');
checkFile('app/mobile/scan/page.tsx', 'Mobile QR Scanner Page');

// 4. Check API Endpoints
console.log('\n🔌 API Endpoints:');
checkFile('app/api/notifications/register-token/route.ts', 'Push Notification Token Registration');

// 5. Check Environment Variables
console.log('\n🔧 Environment Configuration:');
checkEnvVar('NEXT_PUBLIC_SENDER_EMAIL', 'AWS SES Sender Email');
checkEnvVar('AWS_REGION', 'AWS Region');
checkEnvVar('AWS_ACCESS_KEY_ID', 'AWS Access Key ID');
checkEnvVar('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key');

// 6. Check Package Dependencies
console.log('\n📚 Dependencies:');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = {
    '@capacitor/push-notifications': 'Push Notifications',
    '@capacitor/share': 'Share API',
    '@capacitor/haptics': 'Haptics',
    '@capacitor/barcode-scanner': 'Barcode Scanner',
    '@aws-sdk/client-ses': 'AWS SES',
  };

  Object.entries(requiredDeps).forEach(([pkg, desc]) => {
    const installed = pkg in deps;
    console.log(`${installed ? '✅' : '❌'} ${desc} (${pkg})`);
    if (!installed) allChecksPass = false;
  });
}

// 7. Firebase Configuration Check
console.log('\n🔥 Firebase Configuration:');
const firebaseConfigPath = path.join(__dirname, '..', 'android', 'app', 'google-services.json');
const firebaseExists = fs.existsSync(firebaseConfigPath);
console.log(`${firebaseExists ? '✅' : '⚠️ '} Firebase google-services.json ${firebaseExists ? 'configured' : '(optional - needed for push notifications)'}`);

// 8. Documentation
console.log('\n📖 Documentation:');
checkFile('docs/FEATURE-IMPLEMENTATION-SUMMARY.md', 'Feature Implementation Summary');
checkFile('docs/PLUGIN-CONFIGURATION-GUIDE.md', 'Plugin Configuration Guide');

// Summary
console.log('\n' + '='.repeat(50));
if (allChecksPass) {
  console.log('✅ All required features are properly set up!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Verify AWS SES sender email in AWS Console');
  console.log('   2. Add google-services.json for push notifications (optional)');
  console.log('   3. Test features on physical Android device');
  console.log('   4. Run: npm run build:mobile && npx cap sync');
} else {
  console.log('❌ Some features are missing or not configured');
  console.log('\n📝 Please review the errors above and:');
  console.log('   1. Ensure all service files were created');
  console.log('   2. Configure AWS SES in .env.local');
  console.log('   3. Install missing dependencies');
}
console.log('');

process.exit(allChecksPass ? 0 : 1);
