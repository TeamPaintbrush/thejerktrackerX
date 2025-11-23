// Seed test locations for development
// Run with: node scripts/seed-test-locations.js

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

async function createLocation(location) {
  const locationWithId = {
    ...location,
    id: randomUUID(),
    type: 'location',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const command = new PutCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME || 'JerkTrackerOrders',
    Item: locationWithId
  });

  await docClient.send(command);
  return locationWithId;
}

async function seedTestLocations() {
  console.log('🌱 Seeding test locations...');
  
  const businessId = 'test-business-001';
  const timestamp = Date.now();
  
  const testLocations = [
    {
      businessId,
      name: 'Downtown Kingston',
      address: {
        street: '123 King Street',
        city: 'Kingston',
        state: 'Jamaica',
        zipCode: '00000',
        country: 'Jamaica'
      },
      coordinates: {
        latitude: 18.0179,
        longitude: -76.8099
      },
      businessInfo: {
        businessName: 'JERK Tracker Test Restaurant',
        businessType: 'restaurant',
        businessPhone: '+1-876-555-0001',
        businessEmail: 'downtown@jerktrackertest.com'
      },
      verification: {
        status: 'verified',
        method: 'gps',
        verifiedAt: new Date().toISOString(),
        verificationDocument: 'test-doc-001'
      },
      qrCodes: {
        primary: `qr-downtown-${timestamp}`,
        backup: `qr-downtown-backup-${timestamp}`,
        generated: new Date().toISOString()
      },
      billing: {
        isActive: true,
        activatedAt: new Date().toISOString(),
        monthlyUsage: 0
      },
      settings: {
        isActive: true,
        timezone: 'America/Jamaica',
        operatingHours: {
          monday: { open: '10:00', close: '22:00' },
          tuesday: { open: '10:00', close: '22:00' },
          wednesday: { open: '10:00', close: '22:00' },
          thursday: { open: '10:00', close: '22:00' },
          friday: { open: '10:00', close: '23:00' },
          saturday: { open: '10:00', close: '23:00' },
          sunday: { open: '11:00', close: '21:00' }
        },
        maxOrdersPerDay: 100
      }
    },
    {
      businessId,
      name: 'Montego Bay Branch',
      address: {
        street: '456 Hip Strip Avenue',
        city: 'Montego Bay',
        state: 'Jamaica',
        zipCode: '00001',
        country: 'Jamaica'
      },
      coordinates: {
        latitude: 18.4762,
        longitude: -77.8939
      },
      businessInfo: {
        businessName: 'JERK Tracker Test Restaurant',
        businessType: 'restaurant',
        businessPhone: '+1-876-555-0002',
        businessEmail: 'montegobay@jerktrackertest.com'
      },
      verification: {
        status: 'verified',
        method: 'gps',
        verifiedAt: new Date().toISOString(),
        verificationDocument: 'test-doc-002'
      },
      qrCodes: {
        primary: `qr-montegobay-${timestamp + 1}`,
        backup: `qr-montegobay-backup-${timestamp + 1}`,
        generated: new Date().toISOString()
      },
      billing: {
        isActive: true,
        activatedAt: new Date().toISOString(),
        monthlyUsage: 0
      },
      settings: {
        isActive: true,
        timezone: 'America/Jamaica',
        operatingHours: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '23:00' },
          saturday: { open: '09:00', close: '23:00' },
          sunday: { open: '10:00', close: '21:00' }
        },
        maxOrdersPerDay: 150
      }
    },
    {
      businessId,
      name: 'Ocho Rios Location',
      address: {
        street: '789 Beach Boulevard',
        city: 'Ocho Rios',
        state: 'Jamaica',
        zipCode: '00002',
        country: 'Jamaica'
      },
      coordinates: {
        latitude: 18.4078,
        longitude: -77.1031
      },
      businessInfo: {
        businessName: 'JERK Tracker Test Restaurant',
        businessType: 'restaurant',
        businessPhone: '+1-876-555-0003',
        businessEmail: 'ochorios@jerktrackertest.com'
      },
      verification: {
        status: 'verified',
        method: 'gps',
        verifiedAt: new Date().toISOString(),
        verificationDocument: 'test-doc-003'
      },
      qrCodes: {
        primary: `qr-ochorios-${timestamp + 2}`,
        backup: `qr-ochorios-backup-${timestamp + 2}`,
        generated: new Date().toISOString()
      },
      billing: {
        isActive: true,
        activatedAt: new Date().toISOString(),
        monthlyUsage: 0
      },
      settings: {
        isActive: true,
        timezone: 'America/Jamaica',
        operatingHours: {
          monday: { open: '08:00', close: '21:00' },
          tuesday: { open: '08:00', close: '21:00' },
          wednesday: { open: '08:00', close: '21:00' },
          thursday: { open: '08:00', close: '21:00' },
          friday: { open: '08:00', close: '22:00' },
          saturday: { open: '08:00', close: '22:00' },
          sunday: { open: '09:00', close: '20:00' }
        },
        maxOrdersPerDay: 80
      }
    }
  ];

  try {
    for (const location of testLocations) {
      console.log(`Creating location: ${location.name}...`);
      const created = await createLocation(location);
      
      console.log(`✅ ${location.name} created successfully`);
      console.log(`   ID: ${created.id}`);
      console.log(`   QR Code: ${created.qrCodes.primary}`);
      console.log(`   Coordinates: ${created.coordinates.latitude}, ${created.coordinates.longitude}\n`);
    }
    
    console.log('✨ Test locations seeded successfully!');
    console.log(`\n📍 Business ID for testing: ${businessId}`);
    console.log('💡 To use these locations, set this businessId in your test user account');
    console.log('   Example: localStorage.setItem("mobile_auth_user", JSON.stringify({ businessId: "test-business-001", ...otherData }))');
    
  } catch (error) {
    console.error('❌ Error seeding locations:', error);
    throw error;
  }
}

seedTestLocations()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
