// Seed test locations for development
// Run with: npx ts-node scripts/seed-test-locations.ts

import { DynamoDBService, Location } from '../lib/dynamodb';

async function seedTestLocations() {
  console.log('🌱 Seeding test locations...');
  
  const businessId = 'test-business-001'; // Use consistent business ID for testing
  
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
        businessType: 'restaurant' as const,
        businessPhone: '+1-876-555-0001',
        businessEmail: 'downtown@jerktrackertest.com'
      },
      verification: {
        status: 'verified' as const,
        method: 'gps' as const,
        verifiedAt: new Date(),
        verificationDocument: 'test-doc-001'
      },
      qrCodes: {
        primary: `qr-downtown-${Date.now()}`,
        backup: `qr-downtown-backup-${Date.now()}`,
        generated: new Date()
      },
      billing: {
        isActive: true,
        activatedAt: new Date(),
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
        businessType: 'restaurant' as const,
        businessPhone: '+1-876-555-0002',
        businessEmail: 'montegobay@jerktrackertest.com'
      },
      verification: {
        status: 'verified' as const,
        method: 'gps' as const,
        verifiedAt: new Date(),
        verificationDocument: 'test-doc-002'
      },
      qrCodes: {
        primary: `qr-montegobay-${Date.now()}`,
        backup: `qr-montegobay-backup-${Date.now()}`,
        generated: new Date()
      },
      billing: {
        isActive: true,
        activatedAt: new Date(),
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
        businessType: 'restaurant' as const,
        businessPhone: '+1-876-555-0003',
        businessEmail: 'ochorios@jerktrackertest.com'
      },
      verification: {
        status: 'verified' as const,
        method: 'gps' as const,
        verifiedAt: new Date(),
        verificationDocument: 'test-doc-003'
      },
      qrCodes: {
        primary: `qr-ochorios-${Date.now()}`,
        backup: `qr-ochorios-backup-${Date.now()}`,
        generated: new Date()
      },
      billing: {
        isActive: true,
        activatedAt: new Date(),
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
      const created = await DynamoDBService.createLocation(location);
      
      if (created) {
        console.log(`✅ ${location.name} created successfully`);
        console.log(`   ID: ${created.id}`);
        console.log(`   QR Code: ${created.qrCodes.primary}`);
        console.log(`   Coordinates: ${created.coordinates.latitude}, ${created.coordinates.longitude}`);
      } else {
        console.log(`❌ Failed to create ${location.name}`);
      }
    }
    
    console.log('\n✨ Test locations seeded successfully!');
    console.log(`\n📍 Business ID for testing: ${businessId}`);
    console.log('💡 Use this business ID in localStorage as "mobile_auth_user.businessId"');
    
  } catch (error) {
    console.error('❌ Error seeding locations:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  seedTestLocations().then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  }).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export { seedTestLocations };
