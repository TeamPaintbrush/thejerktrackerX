'use client';

import React, { useState } from 'react';
import { Check, Trash2, Download, Mail, Archive, MoreHorizontal } from 'lucide-react';
import { LoadingButton } from './Loading';
import { useToast } from './Toast';
import styled from 'styled-components';
import { Order } from '../lib/dynamodb';

const BulkActionsContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${({ theme }) => theme.colors.primary[50]};
  border: 1px solid ${({ theme }) => theme.colors.primary[200]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1rem;
  margin: 1rem 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const BulkHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const SelectionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SelectionText = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary[800]};
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary[600]};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[800]};
  }
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;

  @media (min-width: 768px) {
    display: flex;
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'success' | 'warning' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'success':
        return `
          background: ${theme.colors.success};
          color: white;
          &:hover { background: #16a34a; }
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning};
          color: white;
          &:hover { background: #d97706; }
        `;
      case 'danger':
        return `
          background: ${theme.colors.error};
          color: white;
          &:hover { background: #dc2626; }
        `;
      default:
        return `
          background: ${theme.colors.info};
          color: white;
          &:hover { background: #2563eb; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const MoreActionsContainer = styled.div`
  position: relative;
`;

const MoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${({ theme }) => theme.colors.secondary[100]};
  color: ${({ theme }) => theme.colors.secondary[700]};
  border: 1px solid ${({ theme }) => theme.colors.secondary[300]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary[200]};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  z-index: 20;
  min-width: 180px;
`;

const DropdownItem = styled.button<{ $variant?: 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: background 0.2s ease;

  ${({ $variant, theme }) =>
    $variant === 'danger'
      ? `color: ${theme.colors.error};`
      : `color: ${theme.colors.text.primary};`}

  &:hover {
    background: ${({ theme, $variant }) =>
      $variant === 'danger' ? theme.colors.error + '10' : theme.colors.secondary[50]};
  }

  &:first-child {
    border-radius: ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0 0;
  }

  &:last-child {
    border-radius: 0 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md};
  }
`;



interface BulkActionsProps {
  selectedOrders: string[];
  orders: Order[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({ 
  selectedOrders, 
  orders, 
  onClearSelection,
  onRefresh 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { addToast } = useToast();

  const selectedOrdersData = orders.filter(order => selectedOrders.includes(order.id));
  const selectedCount = selectedOrders.length;

  if (selectedCount === 0) return null;

  const handleBulkAction = async (action: string) => {
    setIsProcessing(true);
    setShowMenu(false);

    try {
      switch (action) {
        case 'markPickedUp':
          await handleMarkAsPickedUp();
          break;
        case 'delete':
          await handleDelete();
          break;
        case 'export':
          await handleExport();
          break;
        case 'sendEmails':
          await handleSendEmails();
          break;
        case 'archive':
          await handleArchive();
          break;
        default:
          throw new Error('Unknown action');
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Bulk Action Failed',
        message: 'Please try again or contact support.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsPickedUp = async () => {
    const pendingOrders = selectedOrdersData.filter(order => order.status === 'pending');
    
    if (pendingOrders.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Action Needed',
        message: 'Selected orders are already picked up.'
      });
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update orders in localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = existingOrders.map((order: Order) => {
      if (selectedOrders.includes(order.id) && order.status === 'pending') {
        return {
          ...order,
          status: 'picked_up',
          pickedUpAt: new Date(),
          driverName: 'Bulk Action Driver',
          driverCompany: 'Admin Update'
        };
      }
      return order;
    });

    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    addToast({
      type: 'success',
      title: 'Orders Updated',
      message: `${pendingOrders.length} orders marked as picked up.`
    });

    onClearSelection();
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCount} orders? This action cannot be undone.`)) {
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove orders from localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = existingOrders.filter((order: Order) => !selectedOrders.includes(order.id));
    localStorage.setItem('orders', JSON.stringify(updatedOrders));

    addToast({
      type: 'success',
      title: 'Orders Deleted',
      message: `${selectedCount} orders have been deleted.`
    });

    onClearSelection();
    onRefresh();
  };

  const handleExport = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create CSV content
    const csvContent = [
      ['Order Number', 'Customer Name', 'Email', 'Status', 'Created', 'Driver', 'Company', 'Picked Up'].join(','),
      ...selectedOrdersData.map(order => [
        order.orderNumber,
        order.customerName || '',
        order.customerEmail || '',
        order.status,
        order.createdAt.toLocaleDateString(),
        order.driverName || '',
        order.driverCompany || '',
        order.pickedUpAt?.toLocaleDateString() || ''
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Export Complete',
      message: `${selectedCount} orders exported to CSV.`
    });

    onClearSelection();
  };

  const handleSendEmails = async () => {
    const ordersWithEmail = selectedOrdersData.filter(order => order.customerEmail);
    
    if (ordersWithEmail.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Email Addresses',
        message: 'Selected orders do not have email addresses.'
      });
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    addToast({
      type: 'success',
      title: 'Emails Sent',
      message: `Status updates sent to ${ordersWithEmail.length} customers.`
    });

    onClearSelection();
  };

  const handleArchive = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, you might move to an archived state instead of deleting
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const archivedOrders = JSON.parse(localStorage.getItem('archivedOrders') || '[]');
    
    const ordersToArchive = existingOrders.filter((order: Order) => selectedOrders.includes(order.id));
    const remainingOrders = existingOrders.filter((order: Order) => !selectedOrders.includes(order.id));
    
    localStorage.setItem('orders', JSON.stringify(remainingOrders));
    localStorage.setItem('archivedOrders', JSON.stringify([...archivedOrders, ...ordersToArchive]));

    addToast({
      type: 'success',
      title: 'Orders Archived',
      message: `${selectedCount} orders have been archived.`
    });

    onClearSelection();
    onRefresh();
  };

  return (
    <BulkActionsContainer>
      <BulkHeader>
        <SelectionInfo>
          <SelectionText>
            {selectedCount} order{selectedCount > 1 ? 's' : ''} selected
          </SelectionText>
          
          <ClearButton onClick={onClearSelection}>
            Clear selection
          </ClearButton>
        </SelectionInfo>

        <ActionsGrid>
          {/* Quick Actions */}
          <ActionButton
            as={LoadingButton}
            onClick={() => handleBulkAction('markPickedUp')}
            isLoading={isProcessing}
            $variant="success"
          >
            <Check size={16} />
            Mark Picked Up
          </ActionButton>

          <ActionButton
            as={LoadingButton}
            onClick={() => handleBulkAction('export')}
            isLoading={isProcessing}
            $variant="primary"
          >
            <Download size={16} />
            Export
          </ActionButton>

          {/* More Actions Menu */}
          <MoreActionsContainer>
            <MoreButton onClick={() => setShowMenu(!showMenu)}>
              <MoreHorizontal size={16} />
            </MoreButton>

            {showMenu && (
              <DropdownMenu>
                <DropdownItem onClick={() => handleBulkAction('sendEmails')}>
                  <Mail size={16} />
                  Send Status Emails
                </DropdownItem>
                
                <DropdownItem onClick={() => handleBulkAction('archive')}>
                  <Archive size={16} />
                  Archive Orders
                </DropdownItem>
                
                <hr />
                
                <DropdownItem
                  onClick={() => handleBulkAction('delete')}
                  $variant="danger"
                >
                  <Trash2 size={16} />
                  Delete Orders
                </DropdownItem>
              </DropdownMenu>
            )}
          </MoreActionsContainer>
        </ActionsGrid>
      </BulkHeader>
    </BulkActionsContainer>
  );
};

export default BulkActions;