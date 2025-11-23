const fs = require('fs');
const path = require('path');
require('ts-node/register');

const { DynamoDBService } = require('../lib/dynamodb');

function loadEnv(fileName) {
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

  const isoNow = new Date().toISOString();

  const basePayload = {
    businessId: 'BUS-001',
    businessInfo: {
      businessName: 'The JERK Tracker X',
      businessType: 'restaurant',
      businessPhone: '+1-813-555-2121',
      businessEmail: 'support@jerktrackerx.com'
    },
    verification: {
      status: 'verified',
      method: 'address',
      verifiedAt: isoNow
    },
    billing: {
      isActive: true,
      activatedAt: isoNow,
      monthlyUsage: 0
    },
    settings: {
      isActive: true,
      timezone: 'America/New_York'
    }
  };

  const locations = [
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
        generated: isoNow
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
        generated: isoNow
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
