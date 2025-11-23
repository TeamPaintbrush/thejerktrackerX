import React from 'react'
import styled from 'styled-components'
import { Location } from '@/lib/dynamodb'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface LocationCardProps {
  location: Location
  onEdit: (location: Location) => void
  onToggleStatus: (locationId: string, newStatus: boolean) => void
  onViewQR: (location: Location) => void
}

const LocationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 20px;
  }
`

const LocationDetails = styled.div`
  margin-bottom: 15px;
  
  p {
    margin: 5px 0;
    color: #666;
    
    strong {
      color: #333;
    }
  }
`

const QRSection = styled.div`
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  
  h4 {
    margin: 0 0 10px 0;
    color: #374151;
    font-size: 16px;
  }
  
  .qr-code {
    text-align: center;
    margin: 10px 0;
    
    canvas {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
  }
  
  .qr-url {
    font-family: monospace;
    font-size: 12px;
    color: #6b7280;
    background: white;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    word-break: break-all;
  }
`

const LocationActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f3f4f6;
`

const VerificationInfo = styled.div`
  margin: 10px 0;
  font-size: 14px;
  color: #6b7280;
  
  .verification-method {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 5px 0;
  }
`

export default function LocationCard({ 
  location, 
  onEdit, 
  onToggleStatus, 
  onViewQR 
}: LocationCardProps) {
  const getStatusBadgeType = (status: string) => {
    switch (status) {
      case 'verified':
        return 'active'
      case 'pending':
        return 'pending'
      case 'rejected':
        return 'error'
      default:
        return 'inactive'
    }
  }

  return (
    <Card variant={location.settings.isActive ? 'default' : 'inactive'}>
      <LocationHeader>
        <div>
          <h3>{location.name}</h3>
          <StatusBadge status={getStatusBadgeType(location.verification.status)}>
            {location.verification.status}
          </StatusBadge>
        </div>
      </LocationHeader>

      <LocationDetails>
        <p><strong>Address:</strong> {`${location.address.street}, ${location.address.city}, ${location.address.state} ${location.address.zipCode}`}</p>
        <p><strong>Phone:</strong> {location.businessInfo.businessPhone}</p>
        <p><strong>Email:</strong> {location.businessInfo.businessEmail}</p>
        
        {location.coordinates && (
          <p>
            <strong>Coordinates:</strong> {location.coordinates.latitude}, {location.coordinates.longitude}
          </p>
        )}
        
        <VerificationInfo>
          <div className="verification-method">
            <span>📍</span>
            <span>GPS Verification: {location.coordinates ? '✓ Enabled' : '✗ Disabled'}</span>
          </div>
          <div className="verification-method">
            <span>📱</span>
            <span>QR Code: {location.qrCodes.primary ? '✓ Generated' : '✗ Not Generated'}</span>
          </div>
          <div className="verification-method">
            <span>�</span>
            <span>Business Type: {location.businessInfo.businessType}</span>
          </div>
        </VerificationInfo>
      </LocationDetails>

      {location.qrCodes.primary && (
        <QRSection>
          <h4>QR Code for Location</h4>
          <div className="qr-url">
            QR Code ID: {location.qrCodes.primary}
          </div>
          {location.qrCodes.lastUsed && (
            <div className="qr-url">
              Last Used: {new Date(location.qrCodes.lastUsed).toLocaleDateString()}
            </div>
          )}
        </QRSection>
      )}

      <LocationActions>
        <Button
          variant="outline"
          size="small"
          onClick={() => onViewQR(location)}
        >
          View QR
        </Button>
        
        <Button
          variant="secondary"
          size="small"
          onClick={() => onEdit(location)}
        >
          Edit
        </Button>
        
        <Button
          variant={location.settings.isActive ? 'danger' : 'primary'}
          size="small"
          onClick={() => onToggleStatus(location.id, !location.settings.isActive)}
        >
          {location.settings.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      </LocationActions>
    </Card>
  )
}