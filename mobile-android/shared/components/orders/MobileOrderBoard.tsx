'use client';

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { DndContext, DragOverlay, closestCorners, TouchSensor, MouseSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { Clock, Package, Truck, CheckCircle, User, Calendar } from 'lucide-react';
import { Order } from '@/lib/dynamodb';
import { useDraggable } from '@dnd-kit/core';

const BoardContainer = styled.div`
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  min-height: calc(100vh - 80px);
  padding: 1rem;
`;

const BoardHeader = styled.div`
  margin-bottom: 1rem;
`;

const BoardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1c1917;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BoardSubtitle = styled.p`
  font-size: 0.875rem;
  color: #78716c;
  margin: 0;
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  
  /* Hide scrollbar for cleaner look */
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d6d3d1;
    border-radius: 2px;
  }
`;

const Column = styled.div<{ $status: string }>`
  background: white;
  border-radius: 12px;
  min-width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => {
    switch (props.$status) {
      case 'pending': return '#f59e0b';
      case 'picked_up': return '#22c55e';
      case 'delivered': return '#3b82f6';
      default: return '#e7e5e4';
    }
  }};
`;

const ColumnHeader = styled.div<{ $status: string }>`
  padding: 1rem;
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
  font-weight: 700;
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
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
`;

const CardsContainer = styled.div<{ $isDraggingOver?: boolean }>`
  flex: 1;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${props => props.$isDraggingOver ? '#f5f5f4' : 'transparent'};
  transition: background 0.2s ease;
  min-height: 200px;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
`;

const OrderCard = styled.div<{ $isDragging?: boolean }>`
  background: white;
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1rem;
  cursor: grab;
  transition: all 0.2s ease;
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &:active {
    cursor: grabbing;
    box-shadow: 0 4px 12px rgba(237, 119, 52, 0.3);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const OrderNumber = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: #ed7734;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
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
    flex-shrink: 0;
  }
  
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  svg {
    width: 40px;
    height: 40px;
    margin-bottom: 0.5rem;
    opacity: 0.3;
  }
`;

interface MobileOrderBoardProps {
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
      
      <CardsContainer>
        {orders.length === 0 ? (
          <EmptyState>
            <Package />
            <div>No orders</div>
          </EmptyState>
        ) : (
          orders.map(order => (
            <DraggableCard key={order.id} order={order} isDragging={activeId === order.id} />
          ))
        )}
      </CardsContainer>
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
      </CardInfo>
    </OrderCard>
  );
};

const MobileOrderBoard: React.FC<MobileOrderBoardProps> = ({ orders, onOrderUpdate }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
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
          <BoardSubtitle>Drag orders to update their status</BoardSubtitle>
        </BoardHeader>
        
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
      </BoardContainer>

      <DragOverlay>
        {activeOrder ? (
          <OrderCard style={{ cursor: 'grabbing', transform: 'rotate(2deg)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
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

export default MobileOrderBoard;
