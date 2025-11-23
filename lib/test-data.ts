// Initialize test data for development
// This creates test locations in memory/DynamoDB when the app starts

import { DynamoDBService } from '../lib/dynamodb';

export async function initializeTestLocations() {
  const businessId = 'test-business-001';
  
  // Check if locations already exist
  const existing = await DynamoDBService.getLocationsByBusinessId(businessId);
  
  if (existing && existing.length > 0) {
    console.log('✅ Test locations already exist:', existing.length);
    return existing;
  }
  
  console.log('🌱 Creating test locations for development...');
  
  const timestamp = Date.now();
  
  const testLocations = [
    {
      businessId,
      name: 'Miami Beach Restaurant',
      address: {
        street: '1234 Ocean Drive',
        city: 'Miami Beach',
        state: 'FL',
        zipCode: '33139',
        country: 'United States'
      },
      coordinates: {
        latitude: 25.7907,
        longitude: -80.1300
      },
      businessInfo: {
        businessName: 'JERK Tracker Test Restaurant',
        businessType: 'restaurant' as const,
        businessPhone: '+1-305-555-0001',
        businessEmail: 'miami@jerktrackertest.com'
      },
      verification: {
        status: 'verified' as const,
        method: 'gps' as const,
        verifiedAt: new Date(),
        verificationDocument: 'test-doc-001'
      },
      qrCodes: {
        primary: `qr-miami-${timestamp}`,
        backup: `qr-miami-backup-${timestamp}`,
        generated: new Date()
      },
      billing: {
        isActive: true,
        activatedAt: new Date(),
        monthlyUsage: 0
      },
      settings: {
        isActive: true,
        timezone: 'America/New_York',
        operatingHours: {
          monday: { open: '11:00', close: '22:00' },
          tuesday: { open: '11:00', close: '22:00' },
          wednesday: { open: '11:00', close: '22:00' },
          thursday: { open: '11:00', close: '22:00' },
          friday: { open: '11:00', close: '23:00' },
          saturday: { open: '11:00', close: '23:00' },
          sunday: { open: '12:00', close: '21:00' }
        },
        maxOrdersPerDay: 100
      }
    },
    {
      businessId,
      name: 'Brooklyn Downtown',
      address: {
        street: '456 Flatbush Avenue',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        country: 'United States'
      },
      coordinates: {
        latitude: 40.6782,
        longitude: -73.9442
      },
      businessInfo: {
        businessName: 'JERK Tracker Test Restaurant',
        businessType: 'restaurant' as const,
        businessPhone: '+1-718-555-0002',
        businessEmail: 'brooklyn@jerktrackertest.com'
      },
      verification: {
        status: 'verified' as const,
        method: 'gps' as const,
        verifiedAt: new Date(),
        verificationDocument: 'test-doc-002'
      },
      qrCodes: {
        primary: `qr-brooklyn-${timestamp + 1}`,
        backup: `qr-brooklyn-backup-${timestamp + 1}`,
        generated: new Date()
      },
      billing: {
        isActive: true,
        activatedAt: new Date(),
        monthlyUsage: 0
      },
      settings: {
        isActive: true,
        timezone: 'America/New_York',
        operatingHours: {
          monday: { open: '10:00', close: '22:00' },
          tuesday: { open: '10:00', close: '22:00' },
          wednesday: { open: '10:00', close: '22:00' },
          thursday: { open: '10:00', close: '22:00' },
          friday: { open: '10:00', close: '23:00' },
          saturday: { open: '10:00', close: '23:00' },
          sunday: { open: '11:00', close: '21:00' }
        },
        maxOrdersPerDay: 150
      }
    },
    {
      businessId,
      name: 'Atlanta Midtown',
      address: {
        street: '789 Peachtree Street',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30308',
        country: 'United States'
      },
      coordinates: {
        latitude: 33.7756,
        longitude: -84.3857
      },
      businessInfo: {
        businessName: 'JERK Tracker Test Restaurant',
        businessType: 'restaurant' as const,
        businessPhone: '+1-404-555-0003',
        businessEmail: 'atlanta@jerktrackertest.com'
      },
      verification: {
        status: 'verified' as const,
        method: 'gps' as const,
        verifiedAt: new Date(),
        verificationDocument: 'test-doc-003'
      },
      qrCodes: {
        primary: `qr-atlanta-${timestamp + 2}`,
        backup: `qr-atlanta-backup-${timestamp + 2}`,
        generated: new Date()
      },
      billing: {
        isActive: true,
        activatedAt: new Date(),
        monthlyUsage: 0
      },
      settings: {
        isActive: true,
        timezone: 'America/New_York',
        operatingHours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '10:00', close: '20:00' }
        },
        maxOrdersPerDay: 80
      }
    }
  ];

  const created = [];
  for (const location of testLocations) {
    const result = await DynamoDBService.createLocation(location);
    if (result) {
      console.log(`✅ Created: ${result.name} (ID: ${result.id})`);
      created.push(result);
    }
  }
  
  console.log(`\n✨ Created ${created.length} test locations`);
  console.log(`📍 Business ID: ${businessId}`);
  
  return created;
}

// Test data for development users
export const TEST_USERS = {
  admin: {
    id: 'test-admin-001',
    email: 'admin@jerktrackerx.com',
    name: 'Test Admin',
    role: 'admin',
    businessId: 'test-business-001'
  },
  manager: {
    id: 'test-manager-001',
    email: 'manager@jerktrackerx.com',
    name: 'Test Manager',
    role: 'manager',
    businessId: 'test-business-001'
  },
  driver: {
    id: 'test-driver-001',
    email: 'driver@jerktrackerx.com',
    name: 'Test Driver',
    role: 'driver',
    businessId: 'test-business-001'
  },
  customer: {
    id: 'test-customer-001',
    email: 'customer@jerktrackerx.com',
    name: 'Test Customer',
    role: 'customer',
    businessId: 'test-business-001'
  }
};
