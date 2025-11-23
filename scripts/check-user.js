const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const client = new DynamoDBClient({
  region: envVars.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

async function checkUser() {
  try {
    console.log('🔍 Searching for brush711@gmail.com in DynamoDB...\n');
    
    const result = await docClient.send(new ScanCommand({
      TableName: 'jerktracker-users',
      FilterExpression: 'contains(email, :email)',
      ExpressionAttributeValues: {
        ':email': 'brush711'
      }
    }));

    if (result.Items && result.Items.length > 0) {
      console.log('✅ User found in DynamoDB!\n');
      result.Items.forEach(user => {
        console.log('User Details:');
        console.log('- ID:', user.id);
        console.log('- Email:', user.email);
        console.log('- Name:', user.name);
        console.log('- Role:', user.role);
        console.log('- Business ID:', user.businessId || 'Not set');
        console.log('- Created:', user.createdAt);
        console.log('- Platform:', user.platform || 'Not set');
        console.log('- Password Hash:', user.password ? 'Set ✅' : 'Not set ❌');
        console.log('');
      });
    } else {
      console.log('❌ User NOT found in DynamoDB');
      console.log('\nThis could mean:');
      console.log('1. Sign-up failed silently');
      console.log('2. API endpoint not reachable');
      console.log('3. Network error during signup\n');
    }

    // Also scan all users
    const allUsers = await docClient.send(new ScanCommand({
      TableName: 'jerktracker-users'
    }));
    
    console.log(`\n📊 Total users in database: ${allUsers.Items?.length || 0}`);
    if (allUsers.Items && allUsers.Items.length > 0) {
      console.log('\nAll users:');
      allUsers.Items.forEach(u => {
        console.log(`  - ${u.email} (${u.role})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking user:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkUser();
