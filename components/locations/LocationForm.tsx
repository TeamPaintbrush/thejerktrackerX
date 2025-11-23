import React, { useState } from 'react'
import styled from 'styled-components'
import { Location } from '@/lib/dynamodb'
import Button from '@/components/ui/Button'

interface LocationFormProps {
  initialLocation?: Partial<Location>
  onSubmit: (locationData: any) => void
  onCancel: () => void
  isLoading?: boolean
}

const FormContainer = styled.div`
  max-width: 600px;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  
  &.full-width {
    grid-column: 1 / -1;
  }
  
  label {
    margin-bottom: 8px;
    font-weight: 500;
    color: #374151;
    font-size: 14px;
  }
  
  input, select, textarea {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    &:disabled {
      background-color: #f9fafb;
      cursor: not-allowed;
    }
  }
  
  textarea {
    min-height: 80px;
    resize: vertical;
  }
`

const AddressSection = styled.div`
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  
  h4 {
    margin: 0 0 15px 0;
    color: #374151;
    font-size: 16px;
  }
`

const BusinessSection = styled.div`
  background: #f0f9ff;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  
  h4 {
    margin: 0 0 15px 0;
    color: #374151;
    font-size: 16px;
  }
`

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`

const ErrorText = styled.p`
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 0;
`

const SuccessText = styled.p`
  color: #059669;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 0;
`

export default function LocationForm({ 
  initialLocation, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: LocationFormProps) {
  const [formData, setFormData] = useState({
    name: initialLocation?.name || '',
    street: initialLocation?.address?.street || '',
    city: initialLocation?.address?.city || '',
    state: initialLocation?.address?.state || '',
    zipCode: initialLocation?.address?.zipCode || '',
    country: initialLocation?.address?.country || 'US',
    businessName: initialLocation?.businessInfo?.businessName || '',
    businessType: initialLocation?.businessInfo?.businessType || 'restaurant',
    businessPhone: initialLocation?.businessInfo?.businessPhone || '',
    businessEmail: initialLocation?.businessInfo?.businessEmail || '',
    latitude: initialLocation?.coordinates?.latitude?.toString() || '',
    longitude: initialLocation?.coordinates?.longitude?.toString() || '',
    timezone: initialLocation?.settings?.timezone || 'America/New_York'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Location name is required'
    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required'
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required'
    if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Business phone is required'
    if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Business email is required'

    // Email validation
    if (formData.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Please enter a valid email address'
    }

    // Phone validation (basic)
    if (formData.businessPhone && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.businessPhone)) {
      newErrors.businessPhone = 'Please enter a valid phone number'
    }

    // Coordinate validation
    if (formData.latitude && (isNaN(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90'
    }
    if (formData.longitude && (isNaN(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const locationData = {
      name: formData.name,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      },
      businessInfo: {
        businessName: formData.businessName,
        businessType: formData.businessType as 'restaurant' | 'retail' | 'service' | 'other',
        businessPhone: formData.businessPhone,
        businessEmail: formData.businessEmail
      },
      coordinates: formData.latitude && formData.longitude ? {
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      } : undefined,
      settings: {
        timezone: formData.timezone
      }
    }

    onSubmit(locationData)
  }

  const handleGeocodeAddress = async () => {
    setIsValidatingAddress(true)
    try {
      // This would integrate with a geocoding service
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock coordinates for demonstration
      setFormData(prev => ({
        ...prev,
        latitude: '40.7128',
        longitude: '-74.0060'
      }))
    } catch (error) {
      console.error('Geocoding failed:', error)
    } finally {
      setIsValidatingAddress(false)
    }
  }

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <FormGroup className="full-width">
          <label htmlFor="name">Location Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Downtown Store, Main Branch"
            disabled={isLoading}
          />
          {errors.name && <ErrorText>{errors.name}</ErrorText>}
        </FormGroup>

        <AddressSection>
          <h4>📍 Address Information</h4>
          <FormGrid>
            <FormGroup className="full-width">
              <label htmlFor="street">Street Address *</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="123 Main Street"
                disabled={isLoading}
              />
              {errors.street && <ErrorText>{errors.street}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                disabled={isLoading}
              />
              {errors.city && <ErrorText>{errors.city}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="NY"
                disabled={isLoading}
              />
              {errors.state && <ErrorText>{errors.state}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="zipCode">ZIP Code *</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="10001"
                disabled={isLoading}
              />
              {errors.zipCode && <ErrorText>{errors.zipCode}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </FormGroup>
          </FormGrid>

          <FormGrid>
            <FormGroup>
              <label htmlFor="latitude">Latitude (Optional)</label>
              <input
                type="number"
                step="any"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="40.7128"
                disabled={isLoading}
              />
              {errors.latitude && <ErrorText>{errors.latitude}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="longitude">Longitude (Optional)</label>
              <input
                type="number"
                step="any"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="-74.0060"
                disabled={isLoading}
              />
              {errors.longitude && <ErrorText>{errors.longitude}</ErrorText>}
            </FormGroup>
          </FormGrid>

          <div style={{ marginTop: '10px' }}>
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={handleGeocodeAddress}
              disabled={isLoading || isValidatingAddress}
            >
              {isValidatingAddress ? 'Validating...' : 'Get Coordinates from Address'}
            </Button>
          </div>
        </AddressSection>

        <BusinessSection>
          <h4>🏢 Business Information</h4>
          <FormGrid>
            <FormGroup className="full-width">
              <label htmlFor="businessName">Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="The JERK Restaurant"
                disabled={isLoading}
              />
              {errors.businessName && <ErrorText>{errors.businessName}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="businessType">Business Type</label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label htmlFor="businessPhone">Business Phone *</label>
              <input
                type="tel"
                id="businessPhone"
                name="businessPhone"
                value={formData.businessPhone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                disabled={isLoading}
              />
              {errors.businessPhone && <ErrorText>{errors.businessPhone}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="businessEmail">Business Email *</label>
              <input
                type="email"
                id="businessEmail"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleChange}
                placeholder="contact@thejerkrestaurant.com"
                disabled={isLoading}
              />
              {errors.businessEmail && <ErrorText>{errors.businessEmail}</ErrorText>}
            </FormGroup>
          </FormGrid>
        </BusinessSection>

        <FormActions>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : initialLocation ? 'Update Location' : 'Add Location'}
          </Button>
        </FormActions>
      </form>
    </FormContainer>
  )
}