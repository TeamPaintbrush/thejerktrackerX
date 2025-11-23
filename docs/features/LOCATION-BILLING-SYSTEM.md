# Location-Based Billing System Documentation

## Overview

The JERK Tracker now includes a comprehensive location-based billing system that ensures accurate billing for customers with multiple restaurant locations. This system prevents billing fraud and provides transparent usage tracking.

## Key Features

### 1. Location Management System (`/settings/locations`)
- **Multi-location support**: Add unlimited restaurant locations
- **Address validation**: Verify physical addresses with GPS coordinates
- **Location verification**: Multiple verification methods (GPS, QR code, IP)
- **Location-specific QR codes**: Each location gets unique QR codes
- **Billing status tracking**: Track active/inactive locations for billing

### 2. Location Detection & Verification (`lib/locationVerification.ts`)
- **GPS-based verification**: Verify orders within 100m of registered location
- **QR code verification**: Most reliable method using location-specific QR codes
- **IP-based fallback**: Secondary verification method
- **Fraud prevention**: Device fingerprinting and coordinate tracking
- **Real-time validation**: Orders are validated before creation

### 3. Per-Location Billing (`lib/billingService.ts`)
- **Usage tracking**: Track orders per location for accurate billing
- **Tiered pricing plans**: Basic ($29.99), Professional ($79.99), Enterprise ($199.99)
- **Overage billing**: Automatic charges for locations beyond plan limits
- **Prorated billing**: Mid-cycle plan changes with prorated adjustments
- **Invoice generation**: Automated billing with detailed line items

### 4. Analytics & Reporting (`/settings/analytics`)
- **Location performance**: Orders, revenue, utilization per location
- **Usage reports**: Detailed breakdown for billing transparency
- **Growth tracking**: Month-over-month performance analysis
- **Export functionality**: CSV export for accounting systems
- **Real-time dashboards**: Live metrics and alerts

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Location-Based Billing System            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Location Mgmt  │    │  Order Creation │                │
│  │                 │    │                 │                │
│  │ • Add locations │    │ • GPS verify    │                │
│  │ • Verify address│ ──▶│ • QR code check │                │
│  │ • Generate QR   │    │ • Track usage   │                │
│  │ • Track billing │    │ • Update billing│                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           ▼                       ▼                        │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Billing Engine │    │   Analytics     │                │
│  │                 │    │                 │                │
│  │ • Calculate fees│    │ • Usage reports │                │
│  │ • Generate bills│    │ • Performance   │                │
│  │ • Track overages│    │ • Export data   │                │
│  │ • Handle prorata│    │ • Real-time dash│                │
│  └─────────────────┘    └─────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Location Table
```typescript
interface Location {
  id: string;
  businessId: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    method: 'address' | 'business_registration' | 'manual' | 'gps';
  };
  qrCodes: {
    primary: string;
    backup?: string;
  };
  billing: {
    isActive: boolean;
    monthlyUsage: number;
  };
}
```

### Enhanced Order Schema
```typescript
interface Order {
  // ... existing fields
  location: {
    locationId: string;
    businessId: string;
    qrCodeId?: string;
    verificationStatus: 'verified' | 'pending' | 'failed';
    coordinates?: { latitude: number; longitude: number };
    ipAddress?: string;
    deviceInfo?: string;
  };
}
```

## Billing Plans

### Basic Plan - $29.99/month
- Up to 3 locations
- Unlimited orders per location
- Basic analytics
- Email support

### Professional Plan - $79.99/month
- Up to 10 locations
- Advanced analytics
- Priority support
- Custom branding

### Enterprise Plan - $199.99/month
- Unlimited locations
- Full analytics suite
- Phone support
- API access

### Overage Pricing
- Additional locations: $24.99/month each
- Automatic billing adjustments
- No setup fees for new locations

## Location Verification Flow

1. **Order Initiation**: Customer scans QR code or accesses order form
2. **Primary Verification**: QR code location verification (most reliable)
3. **GPS Verification**: Check if customer is within 100m of registered location
4. **Fallback Methods**: IP-based location as secondary verification
5. **Fraud Detection**: Device fingerprinting and coordinate accuracy check
6. **Order Processing**: Create order with location tracking data
7. **Usage Update**: Increment location usage counter for billing

## API Integration Points

### Location Verification Service
```typescript
LocationVerificationService.verifyLocationForOrder(
  qrCodeId?: string,
  registeredLocations?: Location[]
): Promise<LocationVerificationResult>
```

### Billing Calculation
```typescript
BillingService.calculateBillingAmount(
  planId: string,
  activeLocations: number,
  isYearly?: boolean
): BillingCalculation
```

### Usage Tracking
```typescript
DynamoDBService.updateLocationUsage(
  locationId: string,
  increment: number
): Promise<boolean>
```

## Security Features

### Fraud Prevention
- **GPS coordinate verification**: Within 100-meter radius
- **Device fingerprinting**: Unique device identification
- **IP address logging**: Track order origins
- **QR code validation**: Location-specific QR codes
- **Usage pattern analysis**: Detect unusual activity

### Privacy Protection
- **Minimal data collection**: Only necessary location data
- **Secure storage**: Encrypted coordinate storage
- **User consent**: Clear location permission requests
- **Data retention**: Automatic cleanup of old location data

## Implementation Steps Completed

✅ **Phase 1: Database Schema**
- Extended DynamoDB schema for locations
- Added location tracking to orders
- Created verification status tracking

✅ **Phase 2: Location Management**
- Location settings dashboard (`/settings/locations`)
- Address validation and verification
- QR code generation per location
- Location activation/deactivation

✅ **Phase 3: Verification System**
- GPS-based location verification
- QR code location matching
- IP fallback verification
- Real-time order validation

✅ **Phase 4: Billing Integration**
- Per-location usage tracking
- Tiered pricing plans
- Overage calculation
- Invoice generation
- Billing dashboard (`/settings/billing`)

✅ **Phase 5: Analytics & Reporting**
- Location performance analytics
- Usage reports and breakdowns
- Real-time dashboards (`/settings/analytics`)
- CSV export functionality

## Usage Examples

### For Restaurant Chain with 3 Locations
```
Plan: Basic ($29.99/month)
Locations: 3 active locations
Monthly Bill: $29.99 (within plan limits)
Usage Tracking: Automatic per-location order counting
```

### For Growing Chain with 12 Locations
```
Plan: Professional ($79.99/month)
Locations: 12 active (2 over limit)
Monthly Bill: $79.99 + (2 × $24.99) = $129.97
Recommendation: Consider Enterprise plan
```

### For Large Franchise with 50 Locations
```
Plan: Enterprise ($199.99/month)
Locations: 50 active (unlimited)
Monthly Bill: $199.99 (no overage charges)
Benefits: Full feature access, phone support
```

## Testing & Validation

### Location Verification Testing
- Test GPS accuracy within and outside 100m radius
- Validate QR code location matching
- Test device fingerprinting consistency
- Verify IP fallback functionality

### Billing Accuracy Testing
- Verify usage counting per location
- Test overage calculations
- Validate prorated billing adjustments
- Test plan upgrade/downgrade scenarios

### Performance Testing
- Load test location verification API
- Test concurrent order processing
- Validate dashboard performance with many locations
- Test export functionality with large datasets

## Future Enhancements

### Phase 2 Improvements (Q2 2026)
- **Advanced fraud detection**: Machine learning patterns
- **Geofencing**: Custom location boundaries
- **Multiple verification modes**: Bluetooth beacons, WiFi fingerprinting
- **Real-time location monitoring**: Live location tracking

### Integration Opportunities
- **Payment processors**: Stripe, PayPal integration
- **Mapping services**: Google Maps, Mapbox integration
- **Analytics platforms**: Google Analytics, Mixpanel
- **Accounting systems**: QuickBooks, Xero integration

## Support & Maintenance

### Monitoring
- Location verification success rates
- Billing accuracy metrics
- Usage reporting performance
- Customer satisfaction scores

### Maintenance Tasks
- Monthly billing accuracy audits
- Location data cleanup
- Performance optimization
- Security updates

## Conclusion

The location-based billing system ensures accurate, transparent, and fraud-resistant billing for multi-location restaurants. The system provides:

1. **Accurate billing**: Per-location usage tracking prevents overcharging or undercharging
2. **Fraud prevention**: Multiple verification methods prevent unauthorized usage
3. **Transparency**: Detailed analytics and reporting for customer confidence
4. **Scalability**: Supports growth from single location to large franchises
5. **Compliance**: Meets billing accuracy requirements for SaaS applications

This system positions The JERK Tracker as a enterprise-ready solution for restaurant chains while maintaining simplicity for single-location businesses.