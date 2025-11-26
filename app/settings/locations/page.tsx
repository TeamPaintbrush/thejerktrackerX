'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { DynamoDBService, Location, User } from '@/lib/dynamodb'
import BackButton from '@/components/settings/BackButton'
// Simple toast notification component
const SimpleToast = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => props.type === 'success' ? '#10b981' : '#ef4444'};
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  
  button {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    margin-left: auto;
  }
`
import { LoadingSpinner } from '@/components/Loading'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`

const PageHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
  
  h1 {
    margin: 0;
    color: #333;
    font-size: 28px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const ActionButton = styled.button`
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #5a6fd8;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const LocationCard = styled.div<{ $isActive: boolean }>`
  background: white;
  border: 2px solid ${props => props.$isActive ? '#ed7734' : '#e1e5e9'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`

const LocationHeader = styled.div`
  display: flex;
  justify-content: between;
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

const StatusBadge = styled.span<{ $status: string }>`
  background: ${props => {
    switch (props.$status) {
      case 'verified': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`

const LocationDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const DetailSection = styled.div`
  h4 {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 14px;
    text-transform: uppercase;
    font-weight: 600;
  }
  
  p {
    margin: 5px 0;
    color: #333;
  }
`

const LocationActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const SecondaryButton = styled.button`
  background: transparent;
  color: #ed7734;
  border: 2px solid #ed7734;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #ed7734;
    color: white;
  }
  
  &:disabled {
    border-color: #ccc;
    color: #ccc;
    cursor: not-allowed;
  }
`

const UsageStats = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  
  h4 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 16px;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #ed7734;
      display: block;
    }
    
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
    }
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  
  h2 {
    margin: 0 0 20px 0;
    color: #333;
  }
`

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 600;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #ed7734;
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
`

const FormActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

interface LocationFormData {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessInfo: {
    businessName: string;
    businessType: 'restaurant' | 'retail' | 'service' | 'other';
    businessPhone: string;
    businessEmail: string;
  };
  settings: {
    timezone: string;
    maxOrdersPerDay?: number;
  };
}

export default function LocationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    businessInfo: {
      businessName: '',
      businessType: 'restaurant',
      businessPhone: '',
      businessEmail: ''
    },
    settings: {
      timezone: 'America/New_York'
    }
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [usageReport, setUsageReport] = useState<{
    totalLocations: number;
    activeLocations: number;
    totalMonthlyUsage: number;
    locationBreakdown: Array<{
      locationId: string;
      name: string;
      monthlyUsage: number;
      isActive: boolean;
    }>;
  } | null>(null)

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true)
      const user = session?.user as User
      
      if (!user.businessId) {
        // Create a business ID if user doesn't have one
        const businessId = 'biz_' + user.id
        // You would update the user record here
        user.businessId = businessId
      }

      const userLocations = await DynamoDBService.getLocationsByBusinessId(user.businessId)
      const report = await DynamoDBService.getLocationUsageReport(user.businessId)
      
      setLocations(userLocations)
      setUsageReport(report)
    } catch (error) {
      console.error('Error loading locations:', error)
      setToast({ message: 'Failed to load locations', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    loadLocations()
  }, [session, status, router, loadLocations])

  const handleAddLocation = () => {
    setEditingLocation(null)
    setFormData({
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States'
      },
      businessInfo: {
        businessName: session?.user?.name || '',
        businessType: 'restaurant',
        businessPhone: '',
        businessEmail: session?.user?.email || ''
      },
      settings: {
        timezone: 'America/New_York'
      }
    })
    setShowModal(true)
  }

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      address: location.address,
      businessInfo: location.businessInfo,
      settings: {
        timezone: location.settings.timezone,
        maxOrdersPerDay: location.settings.maxOrdersPerDay
      }
    })
    setShowModal(true)
  }

  const handleSaveLocation = async () => {
    try {
      setLoading(true)
      const user = session?.user as User

      // Verify address first
      const verification = await DynamoDBService.verifyLocationAddress(formData.address)
      
      if (!verification.isValid) {
        setToast({ message: verification.error || 'Invalid address', type: 'error' })
        return
      }

      if (editingLocation) {
        // Update existing location
        const success = await DynamoDBService.updateLocation(editingLocation.id, {
          name: formData.name,
          address: formData.address,
          businessInfo: formData.businessInfo,
          settings: {
            ...editingLocation.settings,
            timezone: formData.settings.timezone,
            maxOrdersPerDay: formData.settings.maxOrdersPerDay
          }
        })
        
        if (success) {
          setToast({ message: 'Location updated successfully', type: 'success' })
          setShowModal(false)
          loadLocations()
        } else {
          setToast({ message: 'Failed to update location', type: 'error' })
        }
      } else {
        // Create new location
        const newLocation = await DynamoDBService.createLocation({
          businessId: user.businessId || 'biz_' + user.id,
          name: formData.name,
          address: formData.address,
          coordinates: verification.coordinates || { latitude: 0, longitude: 0 },
          businessInfo: formData.businessInfo,
          verification: {
            status: 'pending',
            method: 'address'
          },
          qrCodes: {
            primary: 'qr_' + Date.now(),
            generated: new Date()
          },
          billing: {
            isActive: true,
            activatedAt: new Date(),
            monthlyUsage: 0
          },
          settings: {
            isActive: true,
            timezone: formData.settings.timezone,
            maxOrdersPerDay: formData.settings.maxOrdersPerDay
          }
        })

        if (newLocation) {
          setToast({ message: 'Location created successfully', type: 'success' })
          setShowModal(false)
          loadLocations()
        } else {
          setToast({ message: 'Failed to create location', type: 'error' })
        }
      }
    } catch (error) {
      console.error('Error saving location:', error)
      setToast({ message: 'Failed to save location', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLocationStatus = async (location: Location) => {
    try {
      const success = await DynamoDBService.updateLocation(location.id, {
        billing: {
          ...location.billing,
          isActive: !location.billing.isActive,
          ...(location.billing.isActive 
            ? { deactivatedAt: new Date() } 
            : { activatedAt: new Date() })
        }
      })

      if (success) {
        setToast({ 
          message: `Location ${location.billing.isActive ? 'deactivated' : 'activated'} successfully`, 
          type: 'success' 
        })
        loadLocations()
      } else {
        setToast({ message: 'Failed to update location status', type: 'error' })
      }
    } catch (error) {
      console.error('Error updating location status:', error)
      setToast({ message: 'Failed to update location status', type: 'error' })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <Container>
      <ContentWrapper>
        <BackButton />
        <PageHeader>
          <h1>Store Locations</h1>
          <ActionButton onClick={handleAddLocation}>
            Add New Location
          </ActionButton>
        </PageHeader>

        {usageReport && (
          <UsageStats>
            <h4>Location Usage Overview</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{usageReport.totalLocations}</span>
                <span className="stat-label">Total Locations</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{usageReport.activeLocations}</span>
                <span className="stat-label">Active Locations</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{usageReport.totalMonthlyUsage}</span>
                <span className="stat-label">Monthly Orders</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">${(usageReport.activeLocations * 29.99).toFixed(2)}</span>
                <span className="stat-label">Monthly Bill</span>
              </div>
            </div>
          </UsageStats>
        )}

        {locations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <h3>No locations added yet</h3>
            <p>Add your first location to start tracking orders and billing by location.</p>
            <ActionButton onClick={handleAddLocation} style={{ marginTop: '20px' }}>
              Add Your First Location
            </ActionButton>
          </div>
        ) : (
          locations.map(location => (
            <LocationCard key={location.id} $isActive={location.billing.isActive}>
              <LocationHeader>
                <h3>{location.name}</h3>
                <StatusBadge $status={location.verification.status}>
                  {location.verification.status}
                </StatusBadge>
              </LocationHeader>

              <LocationDetails>
                <DetailSection>
                  <h4>Address</h4>
                  <p>{location.address.street}</p>
                  <p>{location.address.city}, {location.address.state} {location.address.zipCode}</p>
                  <p>{location.address.country}</p>
                </DetailSection>

                <DetailSection>
                  <h4>Business Information</h4>
                  <p><strong>{location.businessInfo.businessName}</strong></p>
                  <p>Type: {location.businessInfo.businessType}</p>
                  <p>Phone: {location.businessInfo.businessPhone}</p>
                  <p>Email: {location.businessInfo.businessEmail}</p>
                </DetailSection>
              </LocationDetails>

              <DetailSection>
                <h4>Usage Statistics</h4>
                <p>Monthly Orders: <strong>{location.billing.monthlyUsage}</strong></p>
                <p>QR Code: <strong>{location.qrCodes.primary}</strong></p>
                <p>Status: <strong>{location.billing.isActive ? 'Active' : 'Inactive'}</strong></p>
              </DetailSection>

              <LocationActions>
                <SecondaryButton onClick={() => handleEditLocation(location)}>
                  Edit
                </SecondaryButton>
                <SecondaryButton 
                  onClick={() => handleToggleLocationStatus(location)}
                  style={{ 
                    color: location.billing.isActive ? '#ef4444' : '#10b981',
                    borderColor: location.billing.isActive ? '#ef4444' : '#10b981'
                  }}
                >
                  {location.billing.isActive ? 'Deactivate' : 'Activate'}
                </SecondaryButton>
                <SecondaryButton onClick={() => router.push(`/qr-tracking?location=${location.id}`)}>
                  View QR Code
                </SecondaryButton>
              </LocationActions>
            </LocationCard>
          ))
        )}
      </ContentWrapper>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <h2>{editingLocation ? 'Edit Location' : 'Add New Location'}</h2>
            
            <FormGroup>
              <label>Location Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Downtown Store, Main Branch"
              />
            </FormGroup>

            <FormGroup>
              <label>Street Address</label>
              <input
                type="text"
                value={formData.address.street}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, street: e.target.value }
                }))}
                placeholder="123 Main Street"
              />
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormGroup>
                <label>City</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  placeholder="New York"
                />
              </FormGroup>

              <FormGroup>
                <label>State</label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value }
                  }))}
                  placeholder="NY"
                />
              </FormGroup>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormGroup>
                <label>ZIP Code</label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                  placeholder="10001"
                />
              </FormGroup>

              <FormGroup>
                <label>Country</label>
                <select
                  value={formData.address.country}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, country: e.target.value }
                  }))}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </FormGroup>
            </div>

            <FormGroup>
              <label>Business Name</label>
              <input
                type="text"
                value={formData.businessInfo.businessName}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  businessInfo: { ...prev.businessInfo, businessName: e.target.value }
                }))}
                placeholder="Your Business Name"
              />
            </FormGroup>

            <FormGroup>
              <label>Business Type</label>
              <select
                value={formData.businessInfo.businessType}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  businessInfo: { ...prev.businessInfo, businessType: e.target.value as any }
                }))}
              >
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <FormGroup>
                <label>Business Phone</label>
                <input
                  type="tel"
                  value={formData.businessInfo.businessPhone}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    businessInfo: { ...prev.businessInfo, businessPhone: e.target.value }
                  }))}
                  placeholder="(555) 123-4567"
                />
              </FormGroup>

              <FormGroup>
                <label>Business Email</label>
                <input
                  type="email"
                  value={formData.businessInfo.businessEmail}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    businessInfo: { ...prev.businessInfo, businessEmail: e.target.value }
                  }))}
                  placeholder="business@example.com"
                />
              </FormGroup>
            </div>

            <FormGroup>
              <label>Timezone</label>
              <select
                value={formData.settings.timezone}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, timezone: e.target.value }
                }))}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>Max Orders Per Day (Optional)</label>
              <input
                type="number"
                value={formData.settings.maxOrdersPerDay || ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  settings: { 
                    ...prev.settings, 
                    maxOrdersPerDay: e.target.value ? parseInt(e.target.value) : undefined 
                  }
                }))}
                placeholder="Leave empty for unlimited"
                min="1"
              />
            </FormGroup>

            <FormActions>
              <SecondaryButton onClick={() => setShowModal(false)}>
                Cancel
              </SecondaryButton>
              <ActionButton onClick={handleSaveLocation}>
                {editingLocation ? 'Update Location' : 'Create Location'}
              </ActionButton>
            </FormActions>
          </Modal>
        </ModalOverlay>
      )}

      {toast && (
        <SimpleToast type={toast.type}>
          {toast.message}
          <button onClick={() => setToast(null)}>×</button>
        </SimpleToast>
      )}
    </Container>
  )
}