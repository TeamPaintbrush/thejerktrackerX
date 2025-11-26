#!/usr/bin/env node

/**
 * Mobile Build Script
 * 
 * This script handles the mobile build process:
 * 1. Temporarily renames app/api to app/api.disabled (API routes can't be in static export)
 * 2. Runs Next.js build with BUILD_TARGET=mobile
 * 3. Restores app/api folder
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apiPath = path.join(__dirname, '..', 'app', 'api');
const apiBackupPath = path.join(__dirname, '..', 'app', '_api_backup');
const adminEditPath = path.join(__dirname, '..', 'app', 'admin', 'users', '[id]', 'edit');
const adminEditBackupPath = path.join(__dirname, '..', 'app', '_admin_edit_backup');

console.log('\n📱 Starting mobile build process...\n');

// Helper to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Step 1: Backup and remove folders that don't work with static export
console.log('🔄 Preparing for static export...');

// Backup API folder
if (fs.existsSync(apiPath)) {
  console.log('  - Backing up API routes...');
  if (fs.existsSync(apiBackupPath)) {
    fs.rmSync(apiBackupPath, { recursive: true, force: true });
  }
  copyDir(apiPath, apiBackupPath);
  fs.rmSync(apiPath, { recursive: true, force: true });
}

// Backup admin edit page (has dynamic routes that need server-side)
if (fs.existsSync(adminEditPath)) {
  console.log('  - Backing up admin edit page...');
  if (fs.existsSync(adminEditBackupPath)) {
    fs.rmSync(adminEditBackupPath, { recursive: true, force: true });
  }
  copyDir(adminEditPath, adminEditBackupPath);
  fs.rmSync(adminEditPath, { recursive: true, force: true });
}

console.log('✅ Ready for static export\n');

try {
  // Step 2: Run build
  console.log('🏗️  Building mobile app with static export...\n');
  execSync('cross-env BUILD_TARGET=mobile next build', {
    stdio: 'inherit',
    env: { ...process.env, BUILD_TARGET: 'mobile' }
  });
  console.log('\n✅ Mobile build completed successfully!\n');
} catch (error) {
  console.error('\n❌ Build failed!\n');
  process.exitCode = 1;
} finally {
  // Step 3: Restore folders
  console.log('🔄 Restoring files...');
  
  // Restore API folder
  if (fs.existsSync(apiBackupPath)) {
    console.log('  - Restoring API routes...');
    if (fs.existsSync(apiPath)) {
      fs.rmSync(apiPath, { recursive: true, force: true });
    }
    copyDir(apiBackupPath, apiPath);
    fs.rmSync(apiBackupPath, { recursive: true, force: true });
  }
  
  // Restore admin edit page
  if (fs.existsSync(adminEditBackupPath)) {
    console.log('  - Restoring admin edit page...');
    if (fs.existsSync(adminEditPath)) {
      fs.rmSync(adminEditPath, { recursive: true, force: true });
    }
    copyDir(adminEditBackupPath, adminEditPath);
    fs.rmSync(adminEditBackupPath, { recursive: true, force: true });
  }
  
  console.log('✅ Files restored\n');
}

if (process.exitCode === 0) {
  console.log('📦 Mobile build ready in: out/\n');
  console.log('Next steps:');
  console.log('  - Sync to Android: npx cap sync android');
  console.log('  - Open Android Studio: npx cap open android');
  console.log('');
}
