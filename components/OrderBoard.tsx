'use client';

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Clock, Package, Truck, CheckCircle, User, Phone, Calendar, MapPin } from 'lucide-react';
import { Order } from '../lib/dynamodb';

const BoardContainer = styled.div`
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  overflow: hidden;
`;

const BoardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e7e5e4;
  background: white;
`;

const BoardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1c1917;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BoardContent = styled.div`
  padding: 1.5rem;
  overflow-x: auto;
`;

const ColumnsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  min-height: 500px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Column = styled.div<{ $status: string }>`
  background: white;
  border-radius: 0.75rem;
  border: 2px solid ${props => {
    switch (props.$status) {
      case 'pending': return '#f59e0b';
      case 'picked_up': return '#22c55e';
      case 'delivered': return '#3b82f6';
      default: return '#e7e5e4';
    }
  }};
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

const ColumnHeader = styled.div<{ $status: string }>`
  padding: 1rem 1.25rem;
  border-bottom: 2px solid ${props => {
    switch (props.$status) {
      case 'pending': return '#f59e0b';
      case 'picked_up': return '#22c55e';
      case 'delivered': return '#3b82f6';
      default: return '#e7e5e4';
    }
  }};
  background: ${props => {
    switch (props.$status) {
      case 'pending': return '#fef3c7';
      case 'picked_up': return '#dcfce7';
      case 'delivered': return '#dbeafe';
      default: return '#f5f5f4';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ColumnTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #1c1917;
`;

const ColumnCount = styled.div<{ $status: string }>`
  background: ${props => {
    switch (props.$status) {
      case 'pending': return '#f59e0b';
      case 'picked_up': return '#22c55e';
      case 'delivered': return '#3b82f6';
      default: return '#78716c';
    }
  }};
  color: white;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const CardsContainer = styled.div<{ $isDraggingOver?: boolean }>`
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${props => props.$isDraggingOver ? '#f5f5f4' : 'transparent'};
  transition: background 0.2s ease;
  min-height: 100px;
`;

const OrderCard = styled.div<{ $isDragging?: boolean }>`
  background: white;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: grab;
  transition: all 0.2s ease;
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-color: #ed7734;
  }

  &:active {
    cursor: grabbing;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const OrderNumber = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: #1c1917;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.$status) {
      case 'pending': return '#fef3c7';
      case 'picked_up': return '#dcfce7';
      case 'delivered': return '#dbeafe';
      default: return '#f5f5f4';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'pending': return '#f59e0b';
      case 'picked_up': return '#22c55e';
      case 'delivered': return '#3b82f6';
      default: return '#78716c';
    }
  }};
`;

const CardInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #44403c;

  svg {
    width: 14px;
    height: 14px;
    color: #78716c;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: #a8a29e;
  text-align: center;
  font-size: 0.875rem;
  min-height: 200px;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 0.5rem;
    opacity: 0.3;
  }
`;

interface OrderBoardProps {
  orders: Order[];
  onOrderUpdate?: (orderId: string, newStatus: 'pending' | 'picked_up' | 'delivered') => void;
}

interface DroppableColumnProps {
  id: string;
  status: 'pending' | 'picked_up' | 'delivered';
  title: string;
  icon: React.ReactNode;
  orders: Order[];
  activeId: string | null;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, status, title, icon, orders, activeId }) => {
  return (
    <Column $status={status}>
      <ColumnHeader $status={status}>
        <ColumnTitle>
          {icon}
          {title}
        </ColumnTitle>
        <ColumnCount $status={status}>{orders.length}</ColumnCount>
      </ColumnHeader>
      
      <SortableContext items={orders.map(o => o.id)} strategy={verticalListSortingStrategy}>
        <CardsContainer>
          {orders.length === 0 ? (
            <EmptyState>
              <Package />
              <div>No orders in this status</div>
            </EmptyState>
          ) : (
            orders.map(order => (
              <DraggableCard key={order.id} order={order} isDragging={activeId === order.id} />
            ))
          )}
        </CardsContainer>
      </SortableContext>
    </Column>
  );
};

interface DraggableCardProps {
  order: Order;
  isDragging: boolean;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ order, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: order.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <OrderCard
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
      {...attributes}
      {...listeners}
    >
      <CardHeader>
        <OrderNumber>#{order.orderNumber}</OrderNumber>
        <StatusBadge $status={order.status}>
          {order.status === 'pending' ? 'Pending' : 
           order.status === 'picked_up' ? 'Picked Up' : 
           'Delivered'}
        </StatusBadge>
      </CardHeader>
      
      <CardInfo>
        {order.customerName && (
          <InfoRow>
            <User />
            <span>{order.customerName}</span>
          </InfoRow>
        )}
        
        <InfoRow>
          <Calendar />
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </InfoRow>

        {order.driverName && (
          <InfoRow>
            <Truck />
            <span>{order.driverName}</span>
          </InfoRow>
        )}

        {order.location?.businessId && (
          <InfoRow>
            <MapPin />
            <span>{order.location.businessId}</span>
          </InfoRow>
        )}
      </CardInfo>
    </OrderCard>
  );
};

// Simpler draggable implementation
import { useDraggable } from '@dnd-kit/core';

const OrderBoard: React.FC<OrderBoardProps> = ({ orders, onOrderUpdate }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = useMemo(() => [
    {
      id: 'pending',
      status: 'pending' as const,
      title: 'Pending',
      icon: <Clock size={18} />,
    },
    {
      id: 'picked_up',
      status: 'picked_up' as const,
      title: 'Picked Up',
      icon: <Truck size={18} />,
    },
    {
      id: 'delivered',
      status: 'delivered' as const,
      title: 'Delivered',
      icon: <CheckCircle size={18} />,
    },
  ], []);

  const ordersByStatus = useMemo(() => {
    return {
      pending: orders.filter(o => o.status === 'pending'),
      picked_up: orders.filter(o => o.status === 'picked_up'),
      delivered: orders.filter(o => o.status === 'delivered'),
    };
  }, [orders]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const orderId = active.id as string;
    const newStatus = over.id as 'pending' | 'picked_up' | 'delivered';
    
    // Check if we're dropping over a column (not another card)
    if (columns.some(col => col.id === newStatus)) {
      const order = orders.find(o => o.id === orderId);
      
      if (order && order.status !== newStatus) {
        onOrderUpdate?.(orderId, newStatus);
      }
    }
    
    setActiveId(null);
  };

  const activeOrder = activeId ? orders.find(o => o.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <BoardContainer>
        <BoardHeader>
          <BoardTitle>
            <Package size={20} />
            Orders Board
          </BoardTitle>
        </BoardHeader>
        
        <BoardContent>
          <ColumnsContainer>
            {columns.map(column => (
              <DroppableColumn
                key={column.id}
                id={column.id}
                status={column.status}
                title={column.title}
                icon={column.icon}
                orders={ordersByStatus[column.status]}
                activeId={activeId}
              />
            ))}
          </ColumnsContainer>
        </BoardContent>
      </BoardContainer>

      <DragOverlay>
        {activeOrder ? (
          <OrderCard style={{ cursor: 'grabbing', transform: 'rotate(3deg)' }}>
            <CardHeader>
              <OrderNumber>#{activeOrder.orderNumber}</OrderNumber>
              <StatusBadge $status={activeOrder.status}>
                {activeOrder.status === 'pending' ? 'Pending' : 
                 activeOrder.status === 'picked_up' ? 'Picked Up' : 
                 'Delivered'}
              </StatusBadge>
            </CardHeader>
            <CardInfo>
              {activeOrder.customerName && (
                <InfoRow>
                  <User />
                  <span>{activeOrder.customerName}</span>
                </InfoRow>
              )}
            </CardInfo>
          </OrderCard>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default OrderBoard;
