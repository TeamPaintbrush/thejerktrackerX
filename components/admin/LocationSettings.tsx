import React, { useState } from 'react'
import styled from 'styled-components'
import { MapPin, Navigation, Map } from 'lucide-react'
import { SettingsSection, SettingsItem } from '../ui/SettingsComponents'

interface LocationInfo {
  businessAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  coordinates: {
    latitude: number
    longitude: number
  }
  deliveryZones: Array<{
    id: string
    name: string
    radius: number
    active: boolean
  }>
  enableGeolocation: boolean
}

interface LocationSettingsProps {
  locationInfo: LocationInfo
  onUpdateLocation: (info: Partial<LocationInfo>) => void
}

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const AddressGrid = styled.div`
  display: grid;
  gap: 1rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const FullWidth = styled.div`
  grid-column: 1 / -1;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`

const CoordinatesDisplay = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-top: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`

const CoordItem = styled.div`
  flex: 1;
`

const CoordLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`

const CoordValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
`

const ZoneCard = styled.div<{ $active: boolean }>`
  border: 1px solid ${props => props.$active ? '#667eea' : '#e5e7eb'};
  background: ${props => props.$active ? '#f3f4ff' : 'white'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s;
`

const ZoneHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`

const ZoneName = styled.div`
  font-weight: 600;
  color: #374151;
`

const ZoneRadius = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 0.5rem;
`

const ZoneActions = styled.div`
  display: flex;
  gap: 8px;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  
  ${props => {
    switch(props.$variant) {
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover { background: #dc2626; }
        `
      case 'secondary':
        return `
          background: white;
          color: #667eea;
          border: 1px solid #667eea;
          &:hover { background: #f3f4ff; }
        `
      default:
        return `
          background: #667eea;
          color: white;
          &:hover { background: #5568d3; }
        `
    }
  }}
  
  &:active {
    transform: translateY(1px);
  }
`

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #667eea;
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`

const MapPlaceholder = styled.div`
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 14px;
  margin-top: 1rem;
`

const InfoBox = styled.div`
  padding: 1rem;
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 4px;
  margin-top: 1rem;
`

const InfoText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #1e40af;
  line-height: 1.5;
`

const LocationSettings: React.FC<LocationSettingsProps> = ({
  locationInfo,
  onUpdateLocation
}) => {
  const [localInfo, setLocalInfo] = useState(locationInfo)

  const handleAddressChange = (field: keyof LocationInfo['businessAddress'], value: string) => {
    setLocalInfo(prev => ({
      ...prev,
      businessAddress: {
        ...prev.businessAddress,
        [field]: value
      }
    }))
  }

  const handleZoneToggle = (zoneId: string) => {
    setLocalInfo(prev => ({
      ...prev,
      deliveryZones: prev.deliveryZones.map(zone =>
        zone.id === zoneId ? { ...zone, active: !zone.active } : zone
      )
    }))
  }

  const handleSave = () => {
    onUpdateLocation(localInfo)
  }

  return (
    <>
      <SettingsSection title="Business Location" icon={<MapPin size={20} />}>
        <AddressGrid>
          <FullWidth>
            <FormGroup>
              <Label>Street Address</Label>
              <Input
                type="text"
                value={localInfo.businessAddress.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="123 Main Street"
              />
            </FormGroup>
          </FullWidth>
          
          <FormGroup>
            <Label>City</Label>
            <Input
              type="text"
              value={localInfo.businessAddress.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              placeholder="New York"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>State / Province</Label>
            <Input
              type="text"
              value={localInfo.businessAddress.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              placeholder="NY"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>ZIP / Postal Code</Label>
            <Input
              type="text"
              value={localInfo.businessAddress.zipCode}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              placeholder="10001"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Country</Label>
            <Input
              type="text"
              value={localInfo.businessAddress.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              placeholder="United States"
            />
          </FormGroup>
        </AddressGrid>

        <CoordinatesDisplay>
          <CoordItem>
            <CoordLabel>Latitude</CoordLabel>
            <CoordValue>{localInfo.coordinates.latitude.toFixed(6)}</CoordValue>
          </CoordItem>
          <CoordItem>
            <CoordLabel>Longitude</CoordLabel>
            <CoordValue>{localInfo.coordinates.longitude.toFixed(6)}</CoordValue>
          </CoordItem>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button $variant="secondary">Update Coordinates</Button>
          </div>
        </CoordinatesDisplay>

        <MapPlaceholder>
          <div style={{ textAlign: 'center' }}>
            <Map size={48} style={{ margin: '0 auto 8px' }} />
            <div>Map View (Integration Required)</div>
          </div>
        </MapPlaceholder>

        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <Button onClick={handleSave}>Save Location</Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Delivery Zones" icon={<Navigation size={20} />}>
        {localInfo.deliveryZones.map(zone => (
          <ZoneCard key={zone.id} $active={zone.active}>
            <ZoneHeader>
              <ZoneName>{zone.name}</ZoneName>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={zone.active}
                  onChange={() => handleZoneToggle(zone.id)}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </ZoneHeader>
            <ZoneRadius>Radius: {zone.radius} miles</ZoneRadius>
            <ZoneActions>
              <Button $variant="secondary">Edit Zone</Button>
              <Button $variant="danger">Delete</Button>
            </ZoneActions>
          </ZoneCard>
        ))}

        <Button>Add New Delivery Zone</Button>

        <InfoBox>
          <InfoText>
            💡 Tip: Delivery zones help you define service areas and calculate delivery fees automatically.
            Orders outside your delivery zones will be flagged for review.
          </InfoText>
        </InfoBox>
      </SettingsSection>

      <SettingsSection title="Geolocation Settings" icon={<Map size={20} />}>
        <SettingsItem
          label="Enable Geolocation Tracking"
          description="Allow real-time location tracking for delivery drivers"
        >
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={localInfo.enableGeolocation}
              onChange={() => setLocalInfo(prev => ({ ...prev, enableGeolocation: !prev.enableGeolocation }))}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingsItem>

        <InfoBox>
          <InfoText>
            📍 Geolocation tracking allows customers to see their driver&apos;s real-time location and estimated arrival time.
            This feature requires driver permission and is subject to privacy regulations.
          </InfoText>
        </InfoBox>
      </SettingsSection>
    </>
  )
}

export default LocationSettings
