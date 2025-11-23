// Android Swipe Gestures Component
// Based on QUICK-MOBILE-IMPLEMENTATION.md - Priority Feature #2
// Implements swipe-to-complete and swipe-to-view for Android

'use client';

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Check, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAndroidPlatform } from '../hooks/useAndroidPlatform';

const SwipeContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  background: white;
`;

const ActionLayer = styled.div<{ $side: 'left' | 'right'; $visible: boolean }>`
  position: absolute;
  top: 0;
  bottom: 0;
  ${({ $side }) => $side}: 0;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $side }) => $side === 'left' ? '#10b981' : '#3b82f6'};
  color: white;
  transition: opacity 0.2s ease;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  z-index: 1;
`;

const CardContent = styled.div<{ $offsetX: number }>`
  position: relative;
  transform: translateX(${({ $offsetX }) => $offsetX}px);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  border-radius: 0.5rem;
  z-index: 2;
`;

const SwipeHint = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  transition: opacity 0.2s ease;
  pointer-events: none;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 3;
`;

interface AndroidSwipeableProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  threshold?: number;
  disabled?: boolean;
  children: React.ReactNode;
}

export function AndroidSwipeable({
  onSwipeLeft,
  onSwipeRight,
  leftAction = {
    icon: <Check size={24} />,
    label: 'Complete',
    color: '#10b981'
  },
  rightAction = {
    icon: <Eye size={24} />,
    label: 'View',
    color: '#3b82f6'
  },
  threshold = 80,
  disabled = false,
  children
}: AndroidSwipeableProps) {
  const { capabilities, haptics } = useAndroidPlatform();
  const [offsetX, setOffsetX] = useState(0);
  const [showLeftAction, setShowLeftAction] = useState(false);
  const [showRightAction, setShowRightAction] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const startX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    setShowHint(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isDragging.current) return;

    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;
    
    // Limit swipe distance with diminishing returns for smooth feel
    const maxSwipe = 120;
    const limitedOffset = Math.sign(deltaX) * Math.min(
      Math.abs(deltaX),
      maxSwipe
    );
    
    setOffsetX(limitedOffset);
    
    // Show action indicators
    const newShowLeft = limitedOffset > threshold / 2;
    const newShowRight = limitedOffset < -threshold / 2;
    
    if (newShowLeft !== showLeftAction) {
      setShowLeftAction(newShowLeft);
      if (newShowLeft && capabilities.haptics) {
        haptics.buttonTap();
      }
    }
    
    if (newShowRight !== showRightAction) {
      setShowRightAction(newShowRight);
      if (newShowRight && capabilities.haptics) {
        haptics.buttonTap();
      }
    }

    // Show hint when crossing threshold
    if ((Math.abs(limitedOffset) > threshold / 2) && !showHint) {
      setShowHint(true);
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || !isDragging.current) return;

    isDragging.current = false;
    
    // Execute action if threshold crossed
    if (offsetX > threshold && onSwipeRight) {
      if (capabilities.haptics) {
        await haptics.success();
      }
      onSwipeRight();
    } else if (offsetX < -threshold && onSwipeLeft) {
      if (capabilities.haptics) {
        await haptics.success();
      }
      onSwipeLeft();
    }
    
    // Reset position
    setOffsetX(0);
    setShowLeftAction(false);
    setShowRightAction(false);
    setShowHint(false);
  };

  return (
    <SwipeContainer>
      {/* Left action (swipe right reveals) */}
      <ActionLayer 
        $side="left" 
        $visible={showLeftAction}
        style={{ background: leftAction.color }}
      >
        {leftAction.icon}
      </ActionLayer>
      
      {/* Right action (swipe left reveals) */}
      <ActionLayer 
        $side="right" 
        $visible={showRightAction}
        style={{ background: rightAction.color }}
      >
        {rightAction.icon}
      </ActionLayer>
      
      {/* Swipeable content */}
      <CardContent
        $offsetX={offsetX}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </CardContent>

      {/* Swipe hint */}
      <SwipeHint $visible={showHint}>
        {showLeftAction && (
          <>
            <ArrowRight size={12} />
            {leftAction.label}
          </>
        )}
        {showRightAction && (
          <>
            <ArrowLeft size={12} />
            {rightAction.label}
          </>
        )}
      </SwipeHint>
    </SwipeContainer>
  );
}