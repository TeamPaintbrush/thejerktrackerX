'use client';

import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const PullContainer = styled.div`
  position: relative;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 100%;
  width: 100%;
`;

const RefreshIndicator = styled(motion.div)<{ $pulling: boolean }>`
  position: absolute;
  top: ${props => props.$pulling ? '60px' : '-60px'};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: top 0.3s ease;
`;

const SpinningIcon = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ed7734;
`;

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export default function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80 
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (!containerRef.current) return;
    
    // Only allow pull-to-refresh when scrolled to top
    if (containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!containerRef.current || refreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    // Only track pull if scrolled to top and pulling down
    if (containerRef.current.scrollTop === 0 && distance > 0) {
      pullDistance.current = Math.min(distance, threshold * 1.5);
      
      if (pullDistance.current > threshold * 0.5 && !pulling) {
        setPulling(true);
        if (Capacitor.isNativePlatform()) {
          Haptics.impact({ style: ImpactStyle.Light });
        }
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance.current > threshold && !refreshing) {
      setRefreshing(true);
      
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh error:', error);
      } finally {
        setRefreshing(false);
        setPulling(false);
      }
    } else {
      setPulling(false);
    }
    
    startY.current = 0;
    pullDistance.current = 0;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [refreshing, pulling]);

  return (
    <PullContainer ref={containerRef}>
      <AnimatePresence>
        {(pulling || refreshing) && (
          <RefreshIndicator $pulling={pulling || refreshing}>
            <SpinningIcon
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{
                duration: refreshing ? 1 : 0,
                repeat: refreshing ? Infinity : 0,
                ease: 'linear'
              }}
            >
              <RefreshCw size={24} />
            </SpinningIcon>
          </RefreshIndicator>
        )}
      </AnimatePresence>
      {children}
    </PullContainer>
  );
}
