'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderPage from '../../components/OrderPage';

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Get order ID from URL hash or search params
    const id = searchParams.get('id') || window.location.hash.replace('#', '');
    if (id) {
      setOrderId(id);
    }
  }, [searchParams]);

  if (!orderId) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1>Order Not Found</h1>
        <p>No order ID provided. Please check the URL or go back to the orders list.</p>
        <a href="/admin" style={{ 
          padding: '0.75rem 1.5rem', 
          backgroundColor: '#ed7734', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '0.5rem',
          fontWeight: '500'
        }}>
          Back to Dashboard
        </a>
      </div>
    );
  }

  return <OrderPage orderId={orderId} />;
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        Loading order...
      </div>
    }>
      <OrderDetailContent />
    </Suspense>
  );
}