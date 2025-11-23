// 🔙 Mobile Back Button Component
// Provides consistent back navigation for mobile app

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';

const BackButtonContainer = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 44px; /* Touch target */
  min-height: 44px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    background: #f3f4f6;
  }

  /* Hide on desktop */
  @media (min-width: 769px) {
    display: none;
  }
`;

const BackIcon = styled(ArrowLeft)`
  width: 18px;
  height: 18px;
`;

interface BackButtonProps {
  label?: string;
  href?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Mobile Back Button Component
 * 
 * Features:
 * - Uses browser history by default
 * - Can specify custom href or onClick
 * - Touch-optimized design
 * - Consistent styling across app
 */
export default function BackButton({ 
  label = "Back", 
  href, 
  className,
  onClick 
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <BackButtonContainer 
      onClick={handleClick}
      className={className}
    >
      <BackIcon />
      {label}
    </BackButtonContainer>
  );
}

/**
 * Back Button with fixed positioning for overlaying content
 */
export const FloatingBackButton = styled(BackButton)`
  position: fixed;
  top: calc(env(safe-area-inset-top) + 1rem);
  left: 1rem;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(229, 231, 235, 0.8);
`;

/**
 * Back Button for page headers
 */
export const HeaderBackButton = styled(BackButton)`
  margin-bottom: 1rem;
`;