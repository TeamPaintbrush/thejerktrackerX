import React from 'react';
import Link from 'next/link';
import { User, RefreshCw, LogOut } from 'lucide-react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: white;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const HeaderWrapper = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (min-width: 640px) {
    padding: 0 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 0 2rem;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
`;

const HeaderInfo = styled.div``;

const HeaderTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const HeaderSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.25rem 0 0 0;
`;

const HeaderNav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    margin-right: 0.25rem;
  }
`;

const AutoRefreshStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};

  span:last-child {
    color: ${({ theme }) => theme.colors.warning[500]};
  }
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;

  svg {
    margin-right: 0.25rem;
  }

  ${({ $variant, theme }) =>
    $variant === 'primary'
      ? `
        background: ${theme.colors.info};
        
        &:hover {
          background: #2563eb;
        }
        
        &:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      `
      : `
        background: ${theme.colors.error};
        
        &:hover {
          background: #dc2626;
        }
        
        &:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
        }
      `}
`;

const Header: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSignOut = () => {
    // Add sign out logic here
    window.location.href = '/';
  };

  return (
    <HeaderContainer role="banner">
      <HeaderWrapper>
        <HeaderContent>
          <HeaderInfo>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <HeaderTitle style={{ cursor: 'pointer' }}>Admin Dashboard</HeaderTitle>
            </Link>
            <HeaderSubtitle>Manage orders and track pickups</HeaderSubtitle>
          </HeaderInfo>
          <HeaderNav role="navigation" aria-label="Admin actions">
            <UserInfo aria-label="Current user">
              <User size={16} aria-hidden="true" />
              <span>Admin User</span>
            </UserInfo>
            <AutoRefreshStatus aria-label="Auto-refresh status">
              <span>Auto-refresh</span>
              <span aria-label="Auto-refresh is currently off">⚪ OFF</span>
            </AutoRefreshStatus>
            <ActionButton
              $variant="primary"
              onClick={handleRefresh}
              aria-label="Refresh page"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Refresh
            </ActionButton>
            <ActionButton
              $variant="danger"
              onClick={handleSignOut}
              aria-label="Sign out of admin dashboard"
            >
              <LogOut size={16} aria-hidden="true" />
              Sign Out
            </ActionButton>
          </HeaderNav>
        </HeaderContent>
      </HeaderWrapper>
    </HeaderContainer>
  );
};

export default Header;