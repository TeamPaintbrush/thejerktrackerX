const https = require('https');

const BASE_URL = 'https://thejerktracker0.vercel.app';

const endpoints = [
  {
    name: 'Health Check',
    method: 'GET',
    path: '/',
    expectedStatus: 200
  },
  {
    name: 'Get All Orders',
    method: 'GET',
    path: '/api/orders',
    expectedStatus: 200
  },
  {
    name: 'Get Locations (requires businessId)',
    method: 'GET',
    path: '/api/locations?businessId=BUS-001',
    expectedStatus: 200
  },
  {
    name: 'Login Endpoint (POST)',
    method: 'POST',
    path: '/api/auth/login',
    expectedStatus: 400, // Should return 400 for empty body
    body: {}
  },
  {
    name: 'Signup Endpoint (POST)',
    method: 'POST',
    path: '/api/auth/signup',
    expectedStatus: 400, // Should return 400 for missing fields
    body: {}
  },
  {
    name: 'Mobile Menu',
    method: 'GET',
    path: '/api/mobile/menu',
    expectedStatus: 200
  }
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const success = status === endpoint.expectedStatus || (status >= 200 && status < 400);
        
        resolve({
          ...endpoint,
          actualStatus: status,
          success,
          response: data.substring(0, 200)
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        ...endpoint,
        success: false,
        error: error.message
      });
    });

    if (endpoint.body) {
      req.write(JSON.stringify(endpoint.body));
    }

    req.end();
  });
}

async function testAllEndpoints() {
  console.log('🧪 Testing Vercel API Endpoints\n');
  console.log('Base URL:', BASE_URL);
  console.log('='.repeat(80));
  console.log('');

  for (const endpoint of endpoints) {
    process.stdout.write(`Testing: ${endpoint.name}... `);
    const result = await testEndpoint(endpoint);
    
    if (result.success) {
      console.log(`✅ ${result.actualStatus}`);
    } else if (result.error) {
      console.log(`❌ ERROR: ${result.error}`);
    } else {
      console.log(`⚠️  ${result.actualStatus} (expected ${result.expectedStatus})`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Summary:');
  
  const results = await Promise.all(endpoints.map(testEndpoint));
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total: ${endpoints.length}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Failed Endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error || `Status ${r.actualStatus}`}`);
    });
  }
  
  console.log('');
}

testAllEndpoints();
