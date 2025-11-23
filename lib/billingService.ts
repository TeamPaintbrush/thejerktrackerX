// Billing service for per-location usage tracking and billing calculation
// Handles subscription management and location-based billing

export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    locations: number;
    ordersPerLocation?: number;
    support: 'email' | 'priority' | 'phone';
    analytics: boolean;
    customBranding: boolean;
  };
}

export interface BillingUsage {
  businessId: string;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  locations: Array<{
    locationId: string;
    locationName: string;
    ordersCount: number;
    isActive: boolean;
    activatedAt?: Date;
    deactivatedAt?: Date;
  }>;
  totals: {
    activeLocations: number;
    totalOrders: number;
    baseCharge: number;
    locationCharges: number;
    totalAmount: number;
  };
  subscription: {
    planId: string;
    isActive: boolean;
    nextBillingDate: Date;
  };
}

export interface Invoice {
  id: string;
  businessId: string;
  invoiceNumber: string;
  billingPeriod: {
    start: Date;
    end: Date;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  tax?: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issuedAt: Date;
  dueDate: Date;
  paidAt?: Date;
}

export class BillingService {
  private static readonly BILLING_PLANS: Record<string, BillingPlan> = {
    basic: {
      id: 'basic',
      name: 'Basic Plan',
      description: 'Perfect for single-location restaurants',
      monthlyPrice: 29.99,
      yearlyPrice: 299.99,
      features: [
        'Up to 3 locations',
        'Unlimited orders per location',
        'Basic analytics',
        'Email support',
        'QR code ordering'
      ],
      limits: {
        locations: 3,
        support: 'email',
        analytics: true,
        customBranding: false
      }
    },
    professional: {
      id: 'professional',
      name: 'Professional Plan',
      description: 'Great for growing restaurant chains',
      monthlyPrice: 79.99,
      yearlyPrice: 799.99,
      features: [
        'Up to 10 locations',
        'Unlimited orders per location',
        'Advanced analytics & reports',
        'Priority email support',
        'Custom branding',
        'Driver management'
      ],
      limits: {
        locations: 10,
        support: 'priority',
        analytics: true,
        customBranding: true
      }
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise Plan',
      description: 'For large restaurant chains and franchises',
      monthlyPrice: 199.99,
      yearlyPrice: 1999.99,
      features: [
        'Unlimited locations',
        'Unlimited orders per location',
        'Full analytics suite & business intelligence',
        'Phone & priority support',
        'Custom branding & white-label',
        'Advanced driver management',
        'API access'
      ],
      limits: {
        locations: -1, // Unlimited
        support: 'phone',
        analytics: true,
        customBranding: true
      }
    }
  };

  /**
   * Calculate billing amount for a business based on active locations
   */
  static calculateBillingAmount(
    planId: string,
    activeLocations: number,
    isYearly: boolean = false
  ): {
    basePrice: number;
    locationOveragePrice: number;
    totalAmount: number;
    isOverage: boolean;
  } {
    const plan = this.BILLING_PLANS[planId];
    if (!plan) {
      throw new Error(`Invalid billing plan: ${planId}`);
    }

    const basePrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const includedLocations = plan.limits.locations;
    
    // Unlimited locations for enterprise
    if (includedLocations === -1) {
      return {
        basePrice,
        locationOveragePrice: 0,
        totalAmount: basePrice,
        isOverage: false
      };
    }

    // Calculate overage for locations beyond the plan limit
    const overageLocations = Math.max(0, activeLocations - includedLocations);
    const locationOverageRate = isYearly ? 239.88 : 24.99; // Per location per month/year
    const locationOveragePrice = overageLocations * locationOverageRate;

    return {
      basePrice,
      locationOveragePrice,
      totalAmount: basePrice + locationOveragePrice,
      isOverage: overageLocations > 0
    };
  }

  /**
   * Generate billing usage report for a specific period
   */
  static async generateUsageReport(
    businessId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<BillingUsage> {
    try {
      // Import DynamoDB service here to avoid circular imports
      const { DynamoDBService } = await import('./dynamodb');
      
      // Get all locations for the business
      const locations = await DynamoDBService.getLocationsByBusinessId(businessId);
      
      // Calculate usage for each location
      const locationUsage = locations.map(location => ({
        locationId: location.id,
        locationName: location.name,
        ordersCount: location.billing.monthlyUsage,
        isActive: location.billing.isActive,
        activatedAt: location.billing.activatedAt,
        deactivatedAt: location.billing.deactivatedAt
      }));

      // Calculate totals
      const activeLocations = locationUsage.filter(loc => loc.isActive).length;
      const totalOrders = locationUsage.reduce((sum, loc) => sum + loc.ordersCount, 0);

      // Get user's subscription info (would be from user record)
      const subscription = {
        planId: 'professional', // This would come from user data
        isActive: true,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };

      // Calculate billing amounts
      const billing = this.calculateBillingAmount(subscription.planId, activeLocations);

      return {
        businessId,
        billingPeriod: { start: periodStart, end: periodEnd },
        locations: locationUsage,
        totals: {
          activeLocations,
          totalOrders,
          baseCharge: billing.basePrice,
          locationCharges: billing.locationOveragePrice,
          totalAmount: billing.totalAmount
        },
        subscription
      };
    } catch (error) {
      console.error('Error generating usage report:', error);
      throw error;
    }
  }

  /**
   * Create an invoice for a billing period
   */
  static async createInvoice(
    businessId: string,
    usageReport: BillingUsage
  ): Promise<Invoice> {
    try {
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const lineItems = [];
      
      // Base subscription line item
      const plan = this.BILLING_PLANS[usageReport.subscription.planId];
      lineItems.push({
        description: `${plan.name} - ${this.formatDateRange(usageReport.billingPeriod)}`,
        quantity: 1,
        unitPrice: usageReport.totals.baseCharge,
        amount: usageReport.totals.baseCharge
      });

      // Location overage line items
      if (usageReport.totals.locationCharges > 0) {
        const overageLocations = usageReport.totals.activeLocations - plan.limits.locations;
        lineItems.push({
          description: `Additional Locations (${overageLocations} locations)`,
          quantity: overageLocations,
          unitPrice: 24.99, // Per location monthly rate
          amount: usageReport.totals.locationCharges
        });
      }

      const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.08; // 8% tax (would be calculated based on business location)
      const total = subtotal + tax;

      const invoice: Invoice = {
        id: `invoice_${Date.now()}`,
        businessId,
        invoiceNumber,
        billingPeriod: usageReport.billingPeriod,
        lineItems,
        subtotal,
        tax,
        total,
        status: 'draft',
        issuedAt: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
      };

      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Check if a business has exceeded their plan limits
   */
  static async checkPlanLimits(
    businessId: string,
    planId: string
  ): Promise<{
    isOverLimit: boolean;
    currentLocations: number;
    planLimit: number;
    overageCount: number;
    recommendedAction: string;
  }> {
    try {
      const { DynamoDBService } = await import('./dynamodb');
      const locations = await DynamoDBService.getLocationsByBusinessId(businessId);
      const activeLocations = locations.filter(loc => loc.billing.isActive).length;
      
      const plan = this.BILLING_PLANS[planId];
      if (!plan) {
        throw new Error(`Invalid plan: ${planId}`);
      }

      const planLimit = plan.limits.locations;
      const isOverLimit = planLimit !== -1 && activeLocations > planLimit;
      const overageCount = isOverLimit ? activeLocations - planLimit : 0;

      let recommendedAction = '';
      if (isOverLimit) {
        if (planId === 'basic' && activeLocations <= 10) {
          recommendedAction = 'Consider upgrading to Professional Plan';
        } else if (planId === 'professional' && activeLocations > 10) {
          recommendedAction = 'Consider upgrading to Enterprise Plan';
        } else {
          recommendedAction = 'Additional location charges will apply';
        }
      }

      return {
        isOverLimit,
        currentLocations: activeLocations,
        planLimit: planLimit === -1 ? Infinity : planLimit,
        overageCount,
        recommendedAction
      };
    } catch (error) {
      console.error('Error checking plan limits:', error);
      throw error;
    }
  }

  /**
   * Get available billing plans
   */
  static getAvailablePlans(): BillingPlan[] {
    return Object.values(this.BILLING_PLANS);
  }

  /**
   * Get plan details by ID
   */
  static getPlanById(planId: string): BillingPlan | null {
    return this.BILLING_PLANS[planId] || null;
  }

  /**
   * Calculate prorated amount for mid-cycle changes
   */
  static calculateProration(
    currentAmount: number,
    newAmount: number,
    daysRemaining: number,
    totalDaysInPeriod: number = 30
  ): {
    proratedCredit: number;
    proratedCharge: number;
    netAmount: number;
  } {
    const dailyCurrentRate = currentAmount / totalDaysInPeriod;
    const dailyNewRate = newAmount / totalDaysInPeriod;
    
    const proratedCredit = dailyCurrentRate * daysRemaining;
    const proratedCharge = dailyNewRate * daysRemaining;
    const netAmount = proratedCharge - proratedCredit;

    return {
      proratedCredit,
      proratedCharge,
      netAmount
    };
  }

  /**
   * Validate location activation for billing
   */
  static async validateLocationActivation(
    businessId: string,
    planId: string
  ): Promise<{
    canActivate: boolean;
    reason?: string;
    suggestedAction?: string;
  }> {
    try {
      const limitCheck = await this.checkPlanLimits(businessId, planId);
      
      if (!limitCheck.isOverLimit) {
        return { canActivate: true };
      }

      // Allow activation but warn about overage charges
      return {
        canActivate: true,
        reason: `This will exceed your plan limit of ${limitCheck.planLimit} locations`,
        suggestedAction: `Additional charges of $24.99/month per location will apply, or ${limitCheck.recommendedAction}`
      };
    } catch (error) {
      console.error('Error validating location activation:', error);
      return {
        canActivate: false,
        reason: 'Unable to validate plan limits'
      };
    }
  }

  /**
   * Format date range for display
   */
  private static formatDateRange(period: { start: Date; end: Date }): string {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    const start = period.start.toLocaleDateString('en-US', options);
    const end = period.end.toLocaleDateString('en-US', options);
    
    return `${start} - ${end}`;
  }

  /**
   * Get usage summary for dashboard display
   */
  static async getUsageSummary(businessId: string): Promise<{
    currentPlan: string;
    locationsUsed: number;
    locationsLimit: number;
    currentMonthOrders: number;
    estimatedMonthlyBill: number;
    nextBillingDate: Date;
    overageWarning?: string;
  }> {
    try {
      const { DynamoDBService } = await import('./dynamodb');
      const locations = await DynamoDBService.getLocationsByBusinessId(businessId);
      const activeLocations = locations.filter(loc => loc.billing.isActive);
      const totalOrders = locations.reduce((sum, loc) => sum + loc.billing.monthlyUsage, 0);
      
      // This would come from user's subscription data
      const currentPlan = 'professional';
      const plan = this.BILLING_PLANS[currentPlan];
      
      const billing = this.calculateBillingAmount(currentPlan, activeLocations.length);
      const limitCheck = await this.checkPlanLimits(businessId, currentPlan);

      return {
        currentPlan: plan.name,
        locationsUsed: activeLocations.length,
        locationsLimit: plan.limits.locations === -1 ? Infinity : plan.limits.locations,
        currentMonthOrders: totalOrders,
        estimatedMonthlyBill: billing.totalAmount,
        nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        overageWarning: limitCheck.isOverLimit ? limitCheck.recommendedAction : undefined
      };
    } catch (error) {
      console.error('Error getting usage summary:', error);
      throw error;
    }
  }
}