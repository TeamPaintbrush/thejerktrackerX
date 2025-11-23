require('dotenv').config({ path: '.env.local' });
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

async function listAllUsers() {
  try {
    console.log('📋 Fetching all users from DynamoDB...\n');
    
    const result = await docClient.send(new ScanCommand({
      TableName: 'jerktracker-users'
    }));

    if (!result.Items || result.Items.length === 0) {
      console.log('❌ No users found in DynamoDB\n');
      return;
    }

    console.log(`✅ Found ${result.Items.length} user(s)\n`);
    console.log('='.repeat(80));
    
    result.Items.forEach((user, index) => {
      console.log(`\n👤 User #${index + 1}`);
      console.log('-'.repeat(80));
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name);
      console.log('🎭 Role:', user.role);
      console.log('🆔 User ID:', user.id);
      console.log('🏢 Business ID:', user.businessId || 'Not set');
      console.log('📱 Platform:', user.platform || 'Not set');
      console.log('🔐 Password Hash:', user.password ? user.password.substring(0, 20) + '...' : 'Not set');
      console.log('📅 Created:', user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown');
      console.log('🔄 Updated:', user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Not updated');
      console.log('🔑 Last Login Platform:', user.lastLoginPlatform || 'Not set');
      
      if (user.subscription) {
        console.log('💳 Subscription:');
        console.log('   - Plan:', user.subscription.plan);
        console.log('   - Tier:', user.subscription.tier);
        console.log('   - Active:', user.subscription.isActive);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Total Users: ${result.Items.length}`);
    console.log(`   Customers: ${result.Items.filter(u => u.role === 'customer').length}`);
    console.log(`   Drivers: ${result.Items.filter(u => u.role === 'driver').length}`);
    console.log(`   Managers: ${result.Items.filter(u => u.role === 'manager').length}`);
    console.log(`   Admins: ${result.Items.filter(u => u.role === 'admin').length}`);
    console.log(`   Mobile Users: ${result.Items.filter(u => u.platform === 'mobile').length}`);
    console.log(`   Web Users: ${result.Items.filter(u => u.platform === 'web').length}\n`);

  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    console.error('Stack:', error.stack);
  }
}

listAllUsers();
