import styled, { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  html, body {
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    height: 100%;
    min-height: 100vh;
    min-height: -webkit-fill-available; /* Mobile viewport height fix */
  }

  body {
    background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
    color: #1c1917;
    line-height: 1.5;
    font-size: 1rem;
    
    /* Mobile-specific optimizations */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    
    /* Prevent zoom on mobile */
    touch-action: manipulation;
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: all 200ms ease;
    
    &:hover {
      opacity: 0.8;
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    transition: all 200ms ease;
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  input, textarea, select {
    font-family: inherit;
    transition: all 200ms ease;
  }

  /* Modern focus styles for accessibility */
  *:focus-visible {
    outline: 2px solid #ed7734;
    outline-offset: 3px;
    border-radius: 4px;
  }

  /* Custom modern scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: linear-gradient(180deg, #fef7ee 0%, #f5f5f4 100%);
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #ed7734 0%, #f19558 100%);
    border-radius: 9999px;
    border: 2px solid #fef7ee;
    
    &:hover {
      background: linear-gradient(180deg, #de5d20 0%, #ed7734 100%);
    }
  }

  /* Modern keyframe animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInBottom {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(237, 119, 52, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(237, 119, 52, 0.5);
    }
  }

  /* 📱 MOBILE-RESPONSIVE STYLES */
  /* Ensure all content fits on mobile screens */
  
  /* Mobile container constraints */
  @media (max-width: 768px) {
    /* Viewport height fix for mobile browsers */
    html {
      height: -webkit-fill-available;
    }
    
    body {
      min-height: -webkit-fill-available;
      font-size: 0.9rem; /* Slightly smaller text on mobile */
    }
    
    /* Prevent horizontal overflow */
    * {
      max-width: 100vw;
    }
    
    /* Make sure containers don't exceed screen width */
    div, section, main, article, aside, header, footer, nav {
      max-width: 100%;
      overflow-x: hidden;
    }
    
    /* Mobile-friendly padding and margins */
    .container, [class*="container"] {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
      max-width: 100% !important;
    }
    
    /* Responsive images and media */
    img, video, canvas, svg {
      max-width: 100%;
      height: auto;
    }
    
    /* Mobile table handling */
    table {
      width: 100%;
      display: block;
      overflow-x: auto;
      white-space: nowrap;
    }
    
    /* Mobile form elements */
    input, textarea, select, button {
      max-width: 100%;
      font-size: 1rem; /* Prevent zoom on iOS */
    }
    
    /* Mobile touch targets (minimum 44px) */
    button, a, [role="button"], input[type="submit"], input[type="button"] {
      min-height: 44px;
      min-width: 44px;
      padding: 0.75rem 1rem;
    }
    
    /* Stack elements vertically on mobile */
    .flex, [class*="flex"] {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    /* Mobile grid adjustments */
    .grid, [class*="grid"] {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
    }
  }
  
  /* Portrait orientation optimizations */
  @media (orientation: portrait) and (max-width: 768px) {
    /* Ensure content fits in portrait mode */
    .main-content, main, [role="main"] {
      padding: 1rem;
      max-width: 100vw;
      min-height: calc(100vh - 120px); /* Account for header/footer */
    }
    
    /* Mobile navigation adjustments */
    nav, .navigation {
      flex-direction: column;
      width: 100%;
    }
    
    /* Mobile card layouts */
    .card, [class*="card"] {
      margin: 0.5rem 0;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  }
  
  /* Safe area insets for notched devices */
  @supports (padding: max(0px)) {
    body {
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
`;

// Common styled components
export const Container = styled.div<{ $maxWidth?: string }>`
  max-width: ${props => props.$maxWidth || '1280px'};
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
  
  /* 📱 Mobile-first responsive padding */
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 1rem;
    box-sizing: border-box;
  }

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0 ${props => props.theme.spacing.lg};
  }

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 0 ${props => props.theme.spacing.xl};
  }
`;

export const Card = styled.div<{ 
  $padding?: string; 
  $shadow?: keyof Theme['shadows'];
  $borderRadius?: keyof Theme['borderRadius'];
}>`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius[props.$borderRadius || 'xl']};
  box-shadow: ${props => props.theme.shadows[props.$shadow || 'soft']};
  padding: ${props => props.$padding || props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

export const Button = styled.button<{
  $variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.lg};
  transition: ${props => props.theme.transitions.normal};
  cursor: pointer;
  text-decoration: none;
  border: none;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};

  /* Size variants */
  ${props => {
    switch (props.$size) {
      case 'sm':
        return `
          padding: ${props.theme.spacing.sm} ${props.theme.spacing.md};
          font-size: ${props.theme.typography.fontSize.sm};
        `;
      case 'lg':
        return `
          padding: ${props.theme.spacing.lg} ${props.theme.spacing.xl};
          font-size: ${props.theme.typography.fontSize.lg};
        `;
      default:
        return `
          padding: ${props.theme.spacing.md} ${props.theme.spacing.lg};
          font-size: ${props.theme.typography.fontSize.base};
        `;
    }
  }}

  /* Style variants */
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: ${props.theme.colors.primary[500]};
          color: ${props.theme.colors.text.inverse};
          box-shadow: ${props.theme.shadows.soft};

          &:hover {
            background: ${props.theme.colors.primary[600]};
            box-shadow: ${props.theme.shadows.medium};
          }

          &:active {
            background: ${props.theme.colors.primary[700]};
          }
        `;
      case 'secondary':
        return `
          background: ${props.theme.colors.secondary[100]};
          color: ${props.theme.colors.text.primary};

          &:hover {
            background: ${props.theme.colors.secondary[200]};
          }

          &:active {
            background: ${props.theme.colors.secondary[300]};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${props.theme.colors.primary[600]};
          border: 1px solid ${props.theme.colors.primary[300]};

          &:hover {
            background: ${props.theme.colors.primary[50]};
            border-color: ${props.theme.colors.primary[400]};
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${props.theme.colors.text.primary};

          &:hover {
            background: ${props.theme.colors.secondary[100]};
          }
        `;
      default:
        return `
          background: ${props.theme.colors.primary[500]};
          color: ${props.theme.colors.text.inverse};
          box-shadow: ${props.theme.shadows.soft};

          &:hover {
            background: ${props.theme.colors.primary[600]};
            box-shadow: ${props.theme.shadows.medium};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.$hasError ? props.theme.colors.error : props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.base};
  background: ${props => props.theme.colors.surface};
  transition: ${props => props.theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary[100]};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.muted};
  }
`;

export const Label = styled.label`
  display: block;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

export const Heading = styled.h1<{ 
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  $size?: keyof Theme['typography']['fontSize'];
  $weight?: keyof Theme['typography']['fontWeight'];
  $color?: string;
  $mb?: string;
}>`
  font-size: ${props => props.theme.typography.fontSize[props.$size || '2xl']};
  font-weight: ${props => props.theme.typography.fontWeight[props.$weight || 'bold']};
  color: ${props => props.$color || props.theme.colors.text.primary};
  margin-bottom: ${props => props.$mb || props.theme.spacing.md};
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

export const Text = styled.p<{
  $size?: keyof Theme['typography']['fontSize'];
  $weight?: keyof Theme['typography']['fontWeight'];
  $color?: string;
  $mb?: string;
}>`
  font-size: ${props => props.theme.typography.fontSize[props.$size || 'base']};
  font-weight: ${props => props.theme.typography.fontWeight[props.$weight || 'normal']};
  color: ${props => props.$color || props.theme.colors.text.secondary};
  margin-bottom: ${props => props.$mb || '0'};
  line-height: ${props => props.theme.typography.lineHeight.normal};
`;

export const Flex = styled.div<{
  $direction?: 'row' | 'column';
  $align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  $justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  $gap?: string;
  $wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.$direction || 'row'};
  align-items: ${props => props.$align || 'stretch'};
  justify-content: ${props => props.$justify || 'flex-start'};
  gap: ${props => props.$gap || '0'};
  flex-wrap: ${props => props.$wrap ? 'wrap' : 'nowrap'};
  
  /* 📱 Mobile flex adjustments */
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

export const Grid = styled.div<{
  $columns?: number;
  $gap?: string;
  $minWidth?: string;
}>`
  display: grid;
  grid-template-columns: ${props => 
    props.$minWidth 
      ? `repeat(auto-fit, minmax(${props.$minWidth}, 1fr))`
      : `repeat(${props.$columns || 1}, 1fr)`
  };
  gap: ${props => props.$gap || props.theme.spacing.md};
  
  /* 📱 Mobile grid adjustments */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;