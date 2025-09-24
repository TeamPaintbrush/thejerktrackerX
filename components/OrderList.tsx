'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Calendar, User, Truck, Search, Filter, X } from 'lucide-react';
import { Card, Heading, Grid, Flex, Button } from '../styles/components';
import BulkActions from './BulkActions';

const OrderListContainer = styled(Card)`
  background: white;
  border: 1px solid #e7e5e4;
`;

const ListHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e7e5e4;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ClearButton = styled.button`
  color: #ed7734;
  background: none;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #de5d20;
  }
`;

const SearchGrid = styled(Grid)`
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a8a29e;
  width: 16px;
  height: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const QuickFiltersSection = styled.div`
  margin-bottom: 1rem;
`;

const QuickFiltersLabel = styled.div`
  font-size: 0.875rem;
  color: #78716c;
  margin-bottom: 0.5rem;
`;

const QuickFiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const QuickFilterButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.$active ? '#ed7734' : '#d6d3d1'};
  background: ${props => props.$active ? '#ed773410' : 'white'};
  color: ${props => props.$active ? '#ed7734' : '#44403c'};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ed7734;
    background: #ed773410;
    color: #ed7734;
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const DateInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const OrderTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9f9f8;
  border-bottom: 1px solid #e7e5e4;
`;

const TableHeaderRow = styled.tr``;

const TableHeaderCell = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 500;
  color: #44403c;
  font-size: 0.875rem;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ selected?: boolean }>`
  border-bottom: 1px solid #e7e5e4;
  background: ${props => props.selected ? '#ed773405' : 'transparent'};
  transition: background-color 0.2s ease;

  &:hover {
    background: #f9f9f8;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  color: #1c1917;
  font-size: 0.875rem;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #ed7734;
`;

const StatusBadge = styled.span<{ status: 'pending' | 'picked_up' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.status === 'pending' ? '#f59e0b20' : '#22c55e20'};
  color: ${props => props.status === 'pending' ? '#f59e0b' : '#22c55e'};
`;

const EmptyState = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: #78716c;
`;

// Additional styled components for the JSX
const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const SearchContainer = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 12px;
    top: 12px;
    color: #78716c;
  }
`;

const StatusSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  color: #1c1917;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const QuickFilterButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const DateRangeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: end;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const DateRangeColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const DateLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  color: #78716c;
  margin-bottom: 0.25rem;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const OrderTableStyled = styled.table`
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f5f5f4;
`;

const OrderNumber = styled.div`
  font-weight: 500;
  color: #1c1917;
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CustomerName = styled.div`
  color: #1c1917;
`;

const CustomerEmail = styled.div`
  font-size: 0.75rem;
  color: #a8a29e;
`;

const DriverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const DriverName = styled.span`
  color: #1c1917;
`;

const DriverCompany = styled.span`
  font-size: 0.75rem;
  color: #78716c;
`;

const ResultsCount = styled.div`
  padding: 0.75rem 1.5rem;
  background-color: #f5f5f4;
  border-bottom: 1px solid #e7e5e4;

  span {
    font-size: 0.875rem;
    color: #78716c;
  }
`;

const NoResults = styled.div`
  padding: 2rem;
  text-align: center;
  color: #78716c;
  border-top: 1px solid #e7e5e4;
`;

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDetails: string;
  status: 'pending' | 'picked_up';
  createdAt: Date;
  driverName?: string;
  driverCompany?: string;
  pickedUpAt?: Date;
}

interface OrderListProps {
  orders: Order[];
  onExportCSV: () => void;
  onRefresh?: () => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onExportCSV, onRefresh = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [dateRange, setDateRange] = useState('');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [quickFilter, setQuickFilter] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);

  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All Statuses') {
      filtered = filtered.filter(order => {
        if (statusFilter === 'Pending') return order.status === 'pending';
        if (statusFilter === 'Picked Up') return order.status === 'picked_up';
        return true;
      });
    }

    // Quick date filters
    if (quickFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        
        switch (quickFilter) {
          case 'Today':
            return orderDay.getTime() === today.getTime();
          case 'Yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return orderDay.getTime() === yesterday.getTime();
          case 'This Week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return orderDate >= weekStart;
          case 'Last 7 Days':
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            return orderDate >= sevenDaysAgo;
          case 'This Month':
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
          case 'Last 30 Days':
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            return orderDate >= thirtyDaysAgo;
          default:
            return true;
        }
      });
    }

    // Custom date range filter
    if (customFromDate || customToDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        const fromDate = customFromDate ? new Date(customFromDate) : null;
        const toDate = customToDate ? new Date(customToDate) : null;
        
        if (fromDate && toDate) {
          return orderDate >= fromDate && orderDate <= toDate;
        } else if (fromDate) {
          return orderDate >= fromDate;
        } else if (toDate) {
          return orderDate <= toDate;
        }
        return true;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, quickFilter, customFromDate, customToDate]);

  // Bulk selection functions
  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Statuses');
    setQuickFilter('');
    setCustomFromDate('');
    setCustomToDate('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <OrderListContainer>
      {/* Header */}
      <ListHeader>
        <HeaderTop>
          <HeaderTitle>
            <Filter size={20} />
            <h2>Orders</h2>
          </HeaderTitle>
          <ClearButton onClick={onExportCSV}>
            Clear Filters
          </ClearButton>
        </HeaderTop>

        {/* Search and Status Filter */}
        <FilterGrid>
          <SearchContainer>
            <Search size={16} />
            <SearchInput
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <StatusSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Picked Up</option>
          </StatusSelect>
        </FilterGrid>

        {/* Quick Filters */}
        <QuickFiltersContainer>
          <QuickFiltersLabel>Quick filters:</QuickFiltersLabel>
          <QuickFilterButtons>
            {['Today', 'Yesterday', 'This Week', 'Last 7 Days', 'This Month', 'Last 30 Days'].map((filter) => (
              <QuickFilterButton
                key={filter}
                onClick={() => setQuickFilter(filter === quickFilter ? '' : filter)}
                $active={quickFilter === filter}
              >
                {filter}
              </QuickFilterButton>
            ))}
          </QuickFilterButtons>
        </QuickFiltersContainer>

        {/* Custom Date Range */}
        <DateRangeGrid>
          <DateRangeColumn>
            <DateLabel>Custom Range:</DateLabel>
            <DateInput
              type="date"
              value={customFromDate}
              onChange={(e) => setCustomFromDate(e.target.value)}
            />
          </DateRangeColumn>
          <DateRangeColumn>
            <DateLabel>to</DateLabel>
            <DateInput
              type="date"
              value={customToDate}
              onChange={(e) => setCustomToDate(e.target.value)}
            />
          </DateRangeColumn>
          <DateRangeColumn>
            <DateLabel>OR Single Date:</DateLabel>
            <DateInput type="date" />
          </DateRangeColumn>
        </DateRangeGrid>
      </ListHeader>

      {/* Results Count */}
      <ResultsCount>
        <span>
          Showing {filteredOrders.length} of {orders.length} orders
        </span>
      </ResultsCount>

      {/* Bulk Actions */}
      <BulkActions
        selectedOrders={selectedOrders}
        orders={orders}
        onClearSelection={clearSelection}
        onRefresh={onRefresh}
      />

      {/* Orders Table/List */}
      <TableContainer>
        {filteredOrders.length === 0 ? (
          <EmptyState>
            No orders found matching your criteria.
          </EmptyState>
        ) : (
          <OrderTableStyled>
            <TableHead>
              <TableRow>
                <TableHeaderCell>
                  <Checkbox
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAll}
                    aria-label="Select all orders"
                  />
                </TableHeaderCell>
                <TableHeaderCell>Order #</TableHeaderCell>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Created</TableHeaderCell>
                <TableHeaderCell>Driver</TableHeaderCell>
                <TableHeaderCell>Picked Up</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} selected={false}>
                  <TableCell>
                    <Checkbox
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      aria-label={`Select order ${order.orderNumber}`}
                    />
                  </TableCell>
                  <TableCell>
                    <OrderNumber>{order.orderNumber}</OrderNumber>
                  </TableCell>
                  <TableCell>
                    <CustomerInfo>
                      <CustomerName>{order.customerName || 'N/A'}</CustomerName>
                      {order.customerEmail && (
                        <CustomerEmail>{order.customerEmail}</CustomerEmail>
                      )}
                    </CustomerInfo>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status}>
                      {order.status === 'pending' ? 'Pending' : 'Picked Up'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {order.driverName ? (
                      <DriverInfo>
                        <User size={16} />
                        <DriverName>{order.driverName}</DriverName>
                        {order.driverCompany && (
                          <DriverCompany>({order.driverCompany})</DriverCompany>
                        )}
                      </DriverInfo>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {order.pickedUpAt ? new Date(order.pickedUpAt).toLocaleString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </OrderTableStyled>
        )}
      </TableContainer>
    </OrderListContainer>
  );
};

export default OrderList;