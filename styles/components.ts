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
  }

  body {
    background-color: #fafaf9;
    color: #1c1917;
    line-height: 1.5;
    font-size: 1rem;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  input, textarea, select {
    font-family: inherit;
  }

  /* Focus styles for accessibility */
  *:focus {
    outline: 2px solid #ed7734;
    outline-offset: 2px;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f5f5f4;
  }

  ::-webkit-scrollbar-thumb {
    background: #d6d3d1;
    border-radius: 9999px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a29e;
  }
`;

// Common styled components
export const Container = styled.div<{ maxWidth?: string }>`
  max-width: ${props => props.maxWidth || '1280px'};
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0 ${props => props.theme.spacing.lg};
  }

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 0 ${props => props.theme.spacing.xl};
  }
`;

export const Card = styled.div<{ 
  padding?: string; 
  shadow?: keyof Theme['shadows'];
  borderRadius?: keyof Theme['borderRadius'];
}>`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius[props.borderRadius || 'xl']};
  box-shadow: ${props => props.theme.shadows[props.shadow || 'soft']};
  padding: ${props => props.padding || props.theme.spacing.lg};
  border: 1px solid ${props => props.theme.colors.border.light};
  transition: ${props => props.theme.transitions.normal};

  &:hover {
    box-shadow: ${props => props.theme.shadows.medium};
  }
`;

export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
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
  width: ${props => props.fullWidth ? '100%' : 'auto'};

  /* Size variants */
  ${props => {
    switch (props.size) {
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
    switch (props.variant) {
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

export const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.hasError ? props.theme.colors.error : props.theme.colors.border.medium};
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
  size?: keyof Theme['typography']['fontSize'];
  weight?: keyof Theme['typography']['fontWeight'];
  color?: string;
  mb?: string;
}>`
  font-size: ${props => props.theme.typography.fontSize[props.size || '2xl']};
  font-weight: ${props => props.theme.typography.fontWeight[props.weight || 'bold']};
  color: ${props => props.color || props.theme.colors.text.primary};
  margin-bottom: ${props => props.mb || props.theme.spacing.md};
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

export const Text = styled.p<{
  size?: keyof Theme['typography']['fontSize'];
  weight?: keyof Theme['typography']['fontWeight'];
  color?: string;
  mb?: string;
}>`
  font-size: ${props => props.theme.typography.fontSize[props.size || 'base']};
  font-weight: ${props => props.theme.typography.fontWeight[props.weight || 'normal']};
  color: ${props => props.color || props.theme.colors.text.secondary};
  margin-bottom: ${props => props.mb || '0'};
  line-height: ${props => props.theme.typography.lineHeight.normal};
`;

export const Flex = styled.div<{
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: string;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: ${props => props.align || 'stretch'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || '0'};
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};
`;

export const Grid = styled.div<{
  columns?: number;
  gap?: string;
  minWidth?: string;
}>`
  display: grid;
  grid-template-columns: ${props => 
    props.minWidth 
      ? `repeat(auto-fit, minmax(${props.minWidth}, 1fr))`
      : `repeat(${props.columns || 1}, 1fr)`
  };
  gap: ${props => props.gap || props.theme.spacing.md};
`;