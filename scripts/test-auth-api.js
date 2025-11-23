const https = require('https');

async function testSignup() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'verceltest@test.com',
      password: 'test123456',
      name: 'Vercel Test User',
      role: 'customer'
    });

    const options = {
      hostname: 'thejerktracker0.vercel.app',
      path: '/api/mobile-auth/signup/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('🧪 Testing Signup API...\n');
    console.log('Request:', postData);
    console.log('');

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
        console.log('');

        try {
          const json = JSON.parse(data);
          if (json.success) {
            console.log('✅ Signup successful!');
            console.log('User created:', json.user);
          } else {
            console.log('❌ Signup failed:', json.error);
          }
        } catch (e) {
          console.log('⚠️  Response is not JSON:', data);
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'verceltest@test.com',
      password: 'test123456'
    });

    const options = {
      hostname: 'thejerktracker0.vercel.app',
      path: '/api/mobile-auth/login/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('\n🧪 Testing Login API...\n');
    console.log('Request:', postData);
    console.log('');

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
        console.log('');

        try {
          const json = JSON.parse(data);
          if (json.success) {
            console.log('✅ Login successful!');
            console.log('User:', json.user);
          } else {
            console.log('❌ Login failed:', json.error);
          }
        } catch (e) {
          console.log('⚠️  Response is not JSON:', data);
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('='.repeat(80));
  console.log('🔍 VERCEL API ENDPOINTS TEST');
  console.log('='.repeat(80));
  
  await testSignup();
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  await testLogin();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ All tests complete!');
  console.log('='.repeat(80));
}

main();
