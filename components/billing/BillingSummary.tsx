import React from 'react'
import styled from 'styled-components'
import { BillingUsage } from '@/lib/billingService'
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface BillingSummaryProps {
  usage: BillingUsage
  onDownloadInvoice?: () => void
  onViewDetails?: () => void
}

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
`

const SummaryItem = styled.div`
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  
  .summary-label {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  
  .summary-value {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    
    &.amount {
      color: #0f766e;
    }
    
    &.warning {
      color: #dc2626;
    }
  }
  
  .summary-subtitle {
    font-size: 12px;
    color: #64748b;
    margin-top: 4px;
  }
`

const LocationBreakdown = styled.div`
  margin: 20px 0;
  
  .breakdown-header {
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
  }
`

const LocationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
  
  .location-info {
    flex: 1;
    
    .location-name {
      font-weight: 500;
      color: #374151;
      margin-bottom: 2px;
    }
    
    .location-details {
      font-size: 12px;
      color: #6b7280;
    }
  }
  
  .location-usage {
    text-align: right;
    
    .usage-count {
      font-weight: 600;
      color: #374151;
    }
    
    .usage-status {
      font-size: 12px;
      color: #6b7280;
    }
  }
`

const BillingPeriod = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  
  .period-label {
    font-size: 13px;
    color: #1e40af;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  
  .period-dates {
    font-size: 16px;
    font-weight: 600;
    color: #1e3a8a;
  }
  
  .next-billing {
    font-size: 12px;
    color: #3730a3;
    margin-top: 4px;
  }
`

const TotalAmount = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  text-align: center;
  
  .total-label {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .total-value {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  .total-period {
    font-size: 14px;
    opacity: 0.8;
  }
`

export default function BillingSummary({ 
  usage, 
  onDownloadInvoice, 
  onViewDetails 
}: BillingSummaryProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <h3>Billing Summary</h3>
        <p>Current billing period usage and charges</p>
      </CardHeader>

      <CardContent>
        <BillingPeriod>
          <div className="period-label">Billing Period</div>
          <div className="period-dates">
            {formatDate(usage.billingPeriod.start)} - {formatDate(usage.billingPeriod.end)}
          </div>
          <div className="next-billing">
            Next billing: {formatDate(usage.subscription.nextBillingDate)}
          </div>
        </BillingPeriod>

        <SummaryGrid>
          <SummaryItem>
            <div className="summary-label">Active Locations</div>
            <div className="summary-value">{usage.totals.activeLocations}</div>
            <div className="summary-subtitle">
              {usage.locations.length} total locations
            </div>
          </SummaryItem>

          <SummaryItem>
            <div className="summary-label">Total Orders</div>
            <div className="summary-value">{usage.totals.totalOrders.toLocaleString()}</div>
            <div className="summary-subtitle">
              Across all locations
            </div>
          </SummaryItem>

          <SummaryItem>
            <div className="summary-label">Base Plan</div>
            <div className="summary-value amount">{formatCurrency(usage.totals.baseCharge)}</div>
            <div className="summary-subtitle">
              Monthly subscription
            </div>
          </SummaryItem>

          <SummaryItem>
            <div className="summary-label">Location Charges</div>
            <div className="summary-value amount">{formatCurrency(usage.totals.locationCharges)}</div>
            <div className="summary-subtitle">
              Additional locations
            </div>
          </SummaryItem>
        </SummaryGrid>

        <LocationBreakdown>
          <div className="breakdown-header">
            Location Usage Breakdown
          </div>
          {usage.locations.map((location, index) => (
            <LocationItem key={index}>
              <div className="location-info">
                <div className="location-name">{location.locationName}</div>
                <div className="location-details">
                  {location.isActive ? (
                    <>
                      Active since {location.activatedAt ? formatDate(location.activatedAt) : 'N/A'}
                    </>
                  ) : (
                    <>
                      Inactive {location.deactivatedAt ? `since ${formatDate(location.deactivatedAt)}` : ''}
                    </>
                  )}
                </div>
              </div>
              <div className="location-usage">
                <div className="usage-count">
                  {location.ordersCount.toLocaleString()} orders
                </div>
                <div className="usage-status">
                  {location.isActive ? '🟢 Active' : '🔴 Inactive'}
                </div>
              </div>
            </LocationItem>
          ))}
        </LocationBreakdown>

        <TotalAmount>
          <div className="total-label">Total Amount Due</div>
          <div className="total-value">{formatCurrency(usage.totals.totalAmount)}</div>
          <div className="total-period">
            For {formatDate(usage.billingPeriod.start)} - {formatDate(usage.billingPeriod.end)}
          </div>
        </TotalAmount>
      </CardContent>

      {(onDownloadInvoice || onViewDetails) && (
        <CardFooter>
          {onViewDetails && (
            <Button variant="outline" onClick={onViewDetails}>
              View Details
            </Button>
          )}
          {onDownloadInvoice && (
            <Button variant="primary" onClick={onDownloadInvoice}>
              Download Invoice
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}