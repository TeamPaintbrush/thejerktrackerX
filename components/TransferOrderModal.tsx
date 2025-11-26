'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, MapPin, ArrowRight } from 'lucide-react';
import { Order, Location, DynamoDBService } from '@/lib/dynamodb';
import { showSuccess, showError } from '@/lib/toast';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f5f5f4;
  border: none;
  border-radius: 0.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e7e5e4;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c1917;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #78716c;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
`;

const TransferFlow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fafaf9;
  border-radius: 0.5rem;
`;

const LocationBox = styled.div`
  flex: 1;
  text-align: center;
`;

const LocationLabel = styled.div`
  font-size: 0.75rem;
  color: #78716c;
  margin-bottom: 0.25rem;
`;

const LocationName = styled.div`
  font-weight: 600;
  color: #1c1917;
  font-size: 0.875rem;
`;

const Arrow = styled.div`
  color: #ed7734;
`;

const FormField = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #44403c;
  margin-bottom: 0.5rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: #1c1917;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(237, 119, 52, 0.3);
    }
  ` : `
    background: #f5f5f4;
    color: #44403c;

    &:hover:not(:disabled) {
      background: #e7e5e4;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

interface TransferOrderModalProps {
  order: Order;
  locations: Location[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferOrderModal({ order, locations, onClose, onSuccess }: TransferOrderModalProps) {
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [reason, setReason] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const availableLocations = locations.filter(loc => loc.id !== order.location.locationId);
  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);

  const handleTransfer = async () => {
    if (!selectedLocationId) {
      showError('Please select a target location');
      return;
    }

    setIsTransferring(true);

    try {
      await DynamoDBService.transferOrder(order.id, selectedLocationId, reason || undefined);
      
      showSuccess(`Order #${order.orderNumber} transferred to ${selectedLocation?.name}`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Transfer failed:', error);
      showError('Failed to transfer order. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Modal>
        <CloseButton onClick={onClose}>
          <X size={18} />
        </CloseButton>

        <Title>Transfer Order</Title>
        <Subtitle>Move this order to a different restaurant location</Subtitle>

        <TransferFlow>
          <LocationBox>
            <LocationLabel>From</LocationLabel>
            <LocationName>
              <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {order.location.locationName || order.location.locationId}
            </LocationName>
          </LocationBox>
          
          <Arrow>
            <ArrowRight size={20} />
          </Arrow>

          <LocationBox>
            <LocationLabel>To</LocationLabel>
            <LocationName>
              {selectedLocation ? (
                <>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  {selectedLocation.name}
                </>
              ) : (
                <span style={{ color: '#a8a29e' }}>Select location</span>
              )}
            </LocationName>
          </LocationBox>
        </TransferFlow>

        <FormField>
          <Label htmlFor="target-location">Target Location *</Label>
          <Select
            id="target-location"
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            disabled={isTransferring}
          >
            <option value="">Select a location</option>
            {availableLocations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name} - {location.address.city}, {location.address.state}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField>
          <Label htmlFor="reason">Reason for Transfer (Optional)</Label>
          <Textarea
            id="reason"
            placeholder="e.g., Customer requested closer location, staffing issues, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isTransferring}
          />
        </FormField>

        <ButtonGroup>
          <Button $variant="secondary" onClick={onClose} disabled={isTransferring}>
            Cancel
          </Button>
          <Button 
            $variant="primary" 
            onClick={handleTransfer}
            disabled={!selectedLocationId || isTransferring}
          >
            {isTransferring ? 'Transferring...' : 'Transfer Order'}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
}
