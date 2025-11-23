import fs from 'fs';
import path from 'path';
import { DynamoDBService, Location } from '../lib/dynamodb';

function loadEnv(fileName: string) {
  const fullPath = path.resolve(process.cwd(), fileName);
  if (!fs.existsSync(fullPath)) {
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const [key, ...rest] = trimmed.split('=');
    if (!key) return;
    const value = rest.join('=').trim();
    if (!value) return;
    process.env[key.trim()] = value;
  });
}

async function run() {
  loadEnv('.env.local');

  const businessId = 'BUS-001';
  const basePayload = {
    businessId,
    businessInfo: {
      businessName: 'The JERK Tracker X',
      businessType: 'restaurant' as const,
      businessPhone: '+1-813-555-2121',
      businessEmail: 'support@jerktrackerx.com'
    },
    verification: {
      status: 'verified' as const,
      method: 'address' as const,
      verifiedAt: new Date()
    },
    billing: {
      isActive: true,
      activatedAt: new Date(),
      monthlyUsage: 0
    },
    settings: {
      isActive: true,
      timezone: 'America/New_York'
    }
  } as const;

  const locations: Array<Omit<Location, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      ...basePayload,
      name: 'Tampa Florida',
      address: {
        street: '123 Riverwalk Dr',
        city: 'Tampa',
        state: 'FL',
        zipCode: '33602',
        country: 'USA'
      },
      coordinates: {
        latitude: 27.9506,
        longitude: -82.4572
      },
      qrCodes: {
        primary: 'qr-tampa-main',
        generated: new Date()
      }
    },
    {
      ...basePayload,
      name: 'Riverview Florida',
      address: {
        street: '456 Bloomingdale Ave',
        city: 'Riverview',
        state: 'FL',
        zipCode: '33578',
        country: 'USA'
      },
      coordinates: {
        latitude: 27.8661,
        longitude: -82.3265
      },
      qrCodes: {
        primary: 'qr-riverview-main',
        generated: new Date()
      }
    }
  ];

  for (const location of locations) {
    const created = await DynamoDBService.createLocation(location);
    console.log('Created location:', created?.name, created?.id);
  }
}

run().catch(error => {
  console.error('Failed to seed locations:', error);
  process.exit(1);
});
