'use client';

import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  padding: 2rem;
`;

const ErrorCard = styled.div`
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 1rem;
  padding: 3rem 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: #fee2e2;
  border-radius: 50%;
  margin-bottom: 1.5rem;

  svg {
    width: 40px;
    height: 40px;
    color: #dc2626;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1c1917;
  margin: 0 0 1rem 0;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #78716c;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const ErrorDetails = styled.details`
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: left;

  summary {
    cursor: pointer;
    font-weight: 600;
    color: #44403c;
    user-select: none;

    &:hover {
      color: #1c1917;
    }
  }

  pre {
    margin-top: 1rem;
    padding: 1rem;
    background: white;
    border: 1px solid #e7e5e4;
    border-radius: 0.5rem;
    overflow-x: auto;
    font-size: 0.875rem;
    color: #dc2626;
    line-height: 1.5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  background: ${props => props.$variant === 'primary' 
    ? 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)'
    : '#f5f5f4'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#44403c'};

  &:hover {
    opacity: ${props => props.$variant === 'primary' ? 0.9 : 1};
    background: ${props => props.$variant === 'secondary' ? '#e7e5e4' : undefined};
    transform: translateY(-1px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorCard>
            <IconWrapper>
              <AlertTriangle />
            </IconWrapper>

            <Title>Oops! Something went wrong</Title>
            <Description>
              We encountered an unexpected error. Don't worry, your data is safe. 
              Try refreshing the page or return to the dashboard.
            </Description>

            {this.state.error && (
              <ErrorDetails>
                <summary>Technical Details</summary>
                <pre>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </ErrorDetails>
            )}

            <ButtonGroup>
              <Button $variant="secondary" onClick={this.handleReset}>
                <RefreshCw />
                Try Again
              </Button>
              <Button 
                $variant="primary" 
                onClick={() => window.location.href = '/'}
              >
                <Home />
                Go to Dashboard
              </Button>
            </ButtonGroup>
          </ErrorCard>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
