'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { Location } from '@/lib/dynamodb';
import { MobileDataService } from '@/mobile-android/shared/services/mobileDataService';
import { theme } from '@/styles/theme';
import { 
  MapPin, 
  Navigation, 
  Map,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';

interface MobileLocationSettingsProps {
  className?: string;
}

interface LocationFormData {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: string;
  longitude: string;
  businessName: string;
  businessType: 'restaurant' | 'retail' | 'service' | 'other';
  businessPhone: string;
  businessEmail: string;
  operatingHours?: string;
}

const LocationContainer = styled.div`
  padding: 0.5rem 1rem;
  padding-bottom: 100px;
  background: ${theme.effects.gradientBackground};
  min-height: calc(100vh - 60px);
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
  background: ${theme.effects.gradientPrimary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const LocationSection = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${theme.shadows.elevation2};
  border: 1px solid ${theme.colors.border.light};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${theme.colors.primary[500]};
  }
`;

const LocationCard = styled(motion.div)<{ $primary?: boolean }>`
  background: ${props => props.$primary 
    ? theme.effects.gradientPrimary
    : theme.colors.surface};
  color: ${props => props.$primary ? 'white' : theme.colors.text.primary};
  border-radius: ${theme.borderRadius.lg};
  padding: 1.25rem;
  margin-bottom: 1rem;
  border: 2px solid ${props => props.$primary 
    ? theme.colors.primary[500] 
    : theme.colors.border.light};
  position: relative;
  box-shadow: ${props => props.$primary 
    ? theme.shadows.coloredShadow 
    : theme.shadows.elevation1};
  transition: ${theme.transitions.smooth};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.elevation3};
  }
`;

const LocationName = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LocationAddress = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  opacity: 0.9;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  line-height: 1.4;
`;

const LocationInfo = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  opacity: 0.8;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.25);
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  backdrop-filter: ${theme.effects.blur};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  padding: 0.75rem;
  background: ${props => {
    if (props.$variant === 'danger') return theme.colors.error;
    if (props.$variant === 'secondary') return theme.colors.secondary[600];
    return theme.effects.gradientPrimary;
  }};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: ${theme.transitions.smooth};
  box-shadow: ${theme.shadows.elevation1};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.elevation2};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: ${theme.effects.gradientAccent};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: ${theme.shadows.elevation2};
  transition: ${theme.transitions.smooth};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.elevation3};
  }
`;

const AlertBox = styled.div<{ $type: 'info' | 'warning' | 'success' }>`
  padding: 1rem;
  border-radius: ${theme.borderRadius.lg};
  background: ${props => {
    if (props.$type === 'success') return theme.colors.accent[50];
    if (props.$type === 'warning') return '#fef3c7';
    return '#eff6ff';
  }};
  border: 1px solid ${props => {
    if (props.$type === 'success') return theme.colors.accent[200];
    if (props.$type === 'warning') return theme.colors.warning;
    return theme.colors.info;
  }};
  color: ${props => {
    if (props.$type === 'success') return '#065f46';
    if (props.$type === 'warning') return '#92400e';
    return '#1e40af';
  }};
  margin-bottom: 1rem;
  font-size: ${theme.typography.fontSize.sm};
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.effects.overlayDark};
  backdrop-filter: ${theme.effects.blur};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius['2xl']};
  padding: 1.5rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${theme.shadows.large};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: ${theme.colors.text.secondary};
  transition: ${theme.transitions.fast};
  
  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

const ModalMessage = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  background: ${theme.colors.surface};
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${theme.colors.text.muted};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  background: ${theme.colors.surface};
  transition: ${theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ToggleLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${theme.colors.primary[500]};
  }
`;

const Toggle = styled.button<{ $active: boolean }>`
  width: 48px;
  height: 28px;
  border-radius: ${theme.borderRadius.full};
  border: none;
  background: ${props => props.$active ? theme.colors.accent[500] : theme.colors.secondary[400]};
  position: relative;
  cursor: pointer;
  transition: ${theme.transitions.smooth};
  box-shadow: ${theme.shadows.inner};

  &::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: ${theme.borderRadius.full};
    background: white;
    top: 3px;
    left: ${props => props.$active ? '23px' : '3px'};
    transition: ${theme.transitions.smooth};
    box-shadow: ${theme.shadows.elevation1};
  }
  
  &:hover {
    box-shadow: ${theme.shadows.elevation2};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${theme.colors.text.secondary};
  
  svg {
    color: ${theme.colors.text.muted};
    margin-bottom: 1rem;
  }
  
  p {
    margin: 0.5rem 0;
    font-size: ${theme.typography.fontSize.sm};
  }
`;

export default function MobileLocationSettings({ className }: MobileLocationSettingsProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [autoDetect, setAutoDetect] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [businessId, setBusinessId] = useState<string>('');
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Jamaica',
    latitude: '',
    longitude: '',
    businessName: '',
    businessType: 'restaurant',
    businessPhone: '',
    businessEmail: '',
    operatingHours: ''
  });

  const loadLocationData = useCallback(async () => {
    setLoading(true);
    
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('mobile_auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const userId = userData.id || userData.email;
          setBusinessId(userId);
          
          // Load tracking settings
          const savedTracking = localStorage.getItem(`tracking_settings_${userId}`);
          if (savedTracking) {
            const trackingSettings = JSON.parse(savedTracking);
            setTrackingEnabled(trackingSettings.enabled ?? true);
            setAutoDetect(trackingSettings.autoDetect ?? false);
          }
          
          // Load locations from DynamoDB
          const loadedLocations = await MobileDataService.getLocationsByBusinessId(userId);
          if (loadedLocations && loadedLocations.length > 0) {
            setLocations(loadedLocations);
          }
        }
      }
    } catch (error) {
      console.error('Error loading location data:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load locations',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadLocationData();
  }, [loadLocationData]);

  const handleTrackingToggle = async (value: boolean) => {
    setTrackingEnabled(value);
    
    if (typeof window !== 'undefined' && businessId) {
      const settings = {
        enabled: value,
        autoDetect
      };
      localStorage.setItem(`tracking_settings_${businessId}`, JSON.stringify(settings));
    }
    
    addToast({
      type: 'success',
      title: value ? 'Tracking Enabled' : 'Tracking Disabled',
      message: value ? 'Location tracking is now active' : 'Location tracking is now off',
      duration: 2000
    });
  };

  const handleAutoDetectToggle = async (value: boolean) => {
    setAutoDetect(value);
    
    if (typeof window !== 'undefined' && businessId) {
      const settings = {
        enabled: trackingEnabled,
        autoDetect: value
      };
      localStorage.setItem(`tracking_settings_${businessId}`, JSON.stringify(settings));
    }
    
    addToast({
      type: 'success',
      title: value ? 'Auto-detect Enabled' : 'Auto-detect Disabled',
      message: value ? 'Location will be detected automatically' : 'Auto-detection is now off',
      duration: 2000
    });
  };

  const handleAddLocation = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Jamaica',
      latitude: '',
      longitude: '',
      businessName: '',
      businessType: 'restaurant',
      businessPhone: '',
      businessEmail: '',
      operatingHours: ''
    });
    setShowLocationForm(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      street: location.address.street,
      city: location.address.city,
      state: location.address.state,
      zipCode: location.address.zipCode,
      country: location.address.country,
      latitude: location.coordinates.latitude.toString(),
      longitude: location.coordinates.longitude.toString(),
      businessName: location.businessInfo.businessName,
      businessType: location.businessInfo.businessType,
      businessPhone: location.businessInfo.businessPhone,
      businessEmail: location.businessInfo.businessEmail,
      operatingHours: ''
    });
    setShowLocationForm(true);
  };

  const handleFormSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.street || !formData.city || !formData.businessName) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        duration: 3000
      });
      return;
    }

    try {
      if (editingLocation) {
        // Update existing location
        const updated = await MobileDataService.updateLocation(editingLocation.id, {
          name: formData.name,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          },
          coordinates: {
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0
          },
          businessInfo: {
            businessName: formData.businessName,
            businessType: formData.businessType,
            businessPhone: formData.businessPhone,
            businessEmail: formData.businessEmail
          },
          updatedAt: new Date()
        });

        if (updated) {
          await loadLocationData();
          addToast({
            type: 'success',
            title: 'Location Updated',
            message: 'Location has been updated successfully',
            duration: 3000
          });
        }
      } else {
        // Create new location
        const newLocation = await MobileDataService.createLocation({
          businessId,
          name: formData.name,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          },
          coordinates: {
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0
          },
          businessInfo: {
            businessName: formData.businessName,
            businessType: formData.businessType,
            businessPhone: formData.businessPhone,
            businessEmail: formData.businessEmail
          },
          verification: {
            status: 'pending',
            method: 'gps'
          },
          qrCodes: {
            primary: `qr_${Date.now()}`,
            generated: new Date()
          },
          billing: {
            isActive: true,
            activatedAt: new Date(),
            monthlyUsage: 0
          },
          settings: {
            isActive: true,
            timezone: 'America/Jamaica'
          }
        });

        if (newLocation) {
          await loadLocationData();
          addToast({
            type: 'success',
            title: 'Location Added',
            message: 'New location has been added successfully',
            duration: 3000
          });
        }
      }

      setShowLocationForm(false);
      setEditingLocation(null);
    } catch (error) {
      console.error('Error saving location:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to save location',
        duration: 3000
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setLocationToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (locationToDelete) {
      try {
        // In a full implementation, you'd call MobileDataService.deleteLocation
        // For now, we'll update the location to mark it as inactive
        await MobileDataService.updateLocation(locationToDelete, {
          settings: {
            ...locations.find(l => l.id === locationToDelete)?.settings,
            isActive: false
          } as any
        });

        await loadLocationData();
        addToast({
          type: 'success',
          title: 'Location Deleted',
          message: 'Location has been removed successfully',
          duration: 3000
        });
      } catch (error) {
        console.error('Error deleting location:', error);
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete location',
          duration: 3000
        });
      }
      
      setShowDeleteConfirm(false);
      setLocationToDelete(null);
    }
  };

  if (loading) {
    return (
      <LocationContainer className={className}>
        <LocationSection
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: theme.colors.text.secondary }}>Loading location settings...</p>
          </div>
        </LocationSection>
      </LocationContainer>
    );
  }

  return (
    <LocationContainer className={className}>
      <Header>
        <Title>Locations</Title>
        <Subtitle>Manage your business locations</Subtitle>
      </Header>

      {/* Tracking Settings */}
      <LocationSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionTitle>
          <Navigation size={20} />
          Tracking Settings
        </SectionTitle>

        <ToggleRow>
          <ToggleLabel>
            <MapPin size={16} />
            Enable Location Tracking
          </ToggleLabel>
          <Toggle
            $active={trackingEnabled}
            onClick={() => handleTrackingToggle(!trackingEnabled)}
          />
        </ToggleRow>

        <ToggleRow>
          <ToggleLabel>
            <Navigation size={16} />
            Auto-detect Location
          </ToggleLabel>
          <Toggle
            $active={autoDetect}
            onClick={() => handleAutoDetectToggle(!autoDetect)}
          />
        </ToggleRow>

        <AlertBox $type="info">
          <AlertCircle size={16} />
          <div>
            Location tracking helps customers see driver&apos;s real-time location and estimated arrival time.
          </div>
        </AlertBox>
      </LocationSection>

      {/* Saved Locations */}
      <LocationSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionTitle>
          <Building2 size={20} />
          Saved Locations ({locations.filter(l => l.settings.isActive).length})
        </SectionTitle>

        {locations.filter(l => l.settings.isActive).length === 0 ? (
          <EmptyState>
            <MapPin size={48} />
            <p><strong>No locations yet</strong></p>
            <p>Add your first business location to get started</p>
          </EmptyState>
        ) : (
          locations.filter(l => l.settings.isActive).map((location, index) => (
            <LocationCard 
              key={location.id} 
              $primary={index === 0}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <LocationName>
                <MapPin size={20} />
                {location.name}
                {index === 0 && (
                  <Badge>
                    <CheckCircle size={12} />
                    Primary
                  </Badge>
                )}
              </LocationName>
              
              <LocationAddress>
                <Building2 size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>
                  {location.address.street}, {location.address.city}
                  {location.address.state && `, ${location.address.state}`}
                </span>
              </LocationAddress>
              
              <LocationInfo>
                <Map size={12} />
                {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
              </LocationInfo>
              
              <LocationInfo>
                <Building2 size={12} />
                {location.businessInfo.businessName}
              </LocationInfo>

              <ButtonGroup>
                <Button
                  $variant="secondary"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEditLocation(location)}
                >
                  <Edit2 size={14} />
                  Edit
                </Button>
                {index !== 0 && (
                  <Button
                    $variant="danger"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeleteClick(location.id)}
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                )}
              </ButtonGroup>
            </LocationCard>
          ))
        )}

        <AddButton
          whileTap={{ scale: 0.98 }}
          onClick={handleAddLocation}
        >
          <Plus size={20} />
          Add New Location
        </AddButton>
      </LocationSection>

      {/* Info */}
      {locations.filter(l => l.settings.isActive).length > 0 && (
        <AlertBox $type="success">
          <CheckCircle size={16} />
          <div>
            {locations.filter(l => l.settings.isActive).length} location{locations.filter(l => l.settings.isActive).length !== 1 ? 's' : ''} configured. 
            All locations are active and ready for orders.
          </div>
        </AlertBox>
      )}
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalTitle>
                <AlertCircle size={20} style={{ color: theme.colors.error }} />
                Delete Location?
              </ModalTitle>
              <ModalMessage>
                Are you sure you want to delete this location? This action cannot be undone.
              </ModalMessage>
              <ModalButtons>
                <Button
                  $variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  whileTap={{ scale: 0.98 }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  $variant="danger"
                  onClick={handleDeleteConfirm}
                  whileTap={{ scale: 0.98 }}
                  style={{ flex: 1 }}
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </ModalButtons>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Add/Edit Location Form Modal */}
      <AnimatePresence>
        {showLocationForm && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLocationForm(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>
                  <MapPin size={20} style={{ color: theme.colors.primary[500] }} />
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </ModalTitle>
                <CloseButton onClick={() => setShowLocationForm(false)}>
                  <X size={24} />
                </CloseButton>
              </ModalHeader>

              <FormGroup>
                <Label>Location Name *</Label>
                <Input
                  type="text"
                  placeholder="e.g., Main Restaurant"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>Business Name *</Label>
                <Input
                  type="text"
                  placeholder="e.g., The Jerk Tracker"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>Business Type</Label>
                <Select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value as any })}
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="retail">Retail</option>
                  <option value="service">Service</option>
                  <option value="other">Other</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Street Address *</Label>
                <Input
                  type="text"
                  placeholder="123 Main Street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </FormGroup>

              <FormGrid>
                <FormGroup>
                  <Label>City *</Label>
                  <Input
                    type="text"
                    placeholder="Kingston"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>State/Parish</Label>
                  <Input
                    type="text"
                    placeholder="St. Andrew"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </FormGroup>
              </FormGrid>

              <FormGrid>
                <FormGroup>
                  <Label>Zip Code</Label>
                  <Input
                    type="text"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Country</Label>
                  <Input
                    type="text"
                    placeholder="Jamaica"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </FormGroup>
              </FormGrid>

              <FormGrid>
                <FormGroup>
                  <Label>Latitude</Label>
                  <Input
                    type="text"
                    placeholder="18.0179"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Longitude</Label>
                  <Input
                    type="text"
                    placeholder="-76.8099"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </FormGroup>
              </FormGrid>

              <FormGroup>
                <Label>Business Phone</Label>
                <Input
                  type="tel"
                  placeholder="+1 876 123 4567"
                  value={formData.businessPhone}
                  onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>Business Email</Label>
                <Input
                  type="email"
                  placeholder="contact@business.com"
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                />
              </FormGroup>

              <ModalButtons>
                <Button
                  $variant="secondary"
                  onClick={() => setShowLocationForm(false)}
                  whileTap={{ scale: 0.98 }}
                  style={{ flex: 1 }}
                >
                  <X size={16} />
                  Cancel
                </Button>
                <Button
                  $variant="primary"
                  onClick={handleFormSubmit}
                  whileTap={{ scale: 0.98 }}
                  style={{ flex: 1 }}
                >
                  <Save size={16} />
                  {editingLocation ? 'Update' : 'Add'} Location
                </Button>
              </ModalButtons>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </LocationContainer>
  );
}
