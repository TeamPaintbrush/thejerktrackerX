require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Variables Check\n');
console.log('='.repeat(80));

const requiredVars = {
  'AWS_REGION': process.env.AWS_REGION,
  'AWS_ACCESS_KEY_ID': process.env.AWS_ACCESS_KEY_ID,
  'AWS_SECRET_ACCESS_KEY': process.env.AWS_SECRET_ACCESS_KEY,
  'NEXT_PUBLIC_MOBILE_API_BASE_URL': process.env.NEXT_PUBLIC_MOBILE_API_BASE_URL,
  'MOBILE_LOCATION_ADMIN_KEY': process.env.MOBILE_LOCATION_ADMIN_KEY,
};

console.log('\n📋 Local Environment (.env.local):');
Object.keys(requiredVars).forEach(key => {
  const value = requiredVars[key];
  const masked = value ? (key.includes('KEY') || key.includes('SECRET') ? value.substring(0, 8) + '...' : value) : '❌ NOT SET';
  console.log(`   ${key}: ${masked}`);
});

console.log('\n\n⚠️  VERCEL ENVIRONMENT VARIABLES TO CHECK:');
console.log('='.repeat(80));
console.log('\nGo to: https://vercel.com/your-project/settings/environment-variables\n');
console.log('Ensure these are set for Production:');
console.log('');
console.log('1. AWS_REGION');
console.log('   Value:', process.env.AWS_REGION || 'us-east-1');
console.log('');
console.log('2. AWS_ACCESS_KEY_ID');
console.log('   Value:', process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 8) + '...' : 'NOT SET');
console.log('');
console.log('3. AWS_SECRET_ACCESS_KEY');
console.log('   Value:', process.env.AWS_SECRET_ACCESS_KEY ? process.env.AWS_SECRET_ACCESS_KEY.substring(0, 8) + '...' : 'NOT SET');
console.log('');
console.log('4. NEXT_PUBLIC_MOBILE_API_BASE_URL');
console.log('   Value: https://thejerktracker0.vercel.app');
console.log('');
console.log('5. MOBILE_LOCATION_ADMIN_KEY');
console.log('   Value:', process.env.MOBILE_LOCATION_ADMIN_KEY ? process.env.MOBILE_LOCATION_ADMIN_KEY.substring(0, 8) + '...' : 'NOT SET');
console.log('');
console.log('='.repeat(80));
