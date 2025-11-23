import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User, RefreshCw, LogOut, Settings, Home } from 'lucide-react';
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
  flex-wrap: nowrap;
  
  /* Mobile adjustments to keep horizontal layout */
  @media (max-width: 768px) {
    padding: 0.75rem 0;
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0;
    gap: 0.5rem;
  }
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
  flex-wrap: nowrap;
  
  /* Ensure horizontal layout on all screen sizes */
  @media (max-width: 768px) {
    gap: 0.5rem;
    flex-shrink: 0;
  }
  
  @media (max-width: 480px) {
    gap: 0.25rem;
  }
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
  const { data: session, status } = useSession();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const isAdmin = session?.user?.role === 'admin';
  const isAuthenticated = !!session;

  return (
    <HeaderContainer role="banner">
      <HeaderWrapper>
        <HeaderContent>
          <HeaderInfo>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <HeaderTitle style={{ cursor: 'pointer' }}>JERK Tracker</HeaderTitle>
            </Link>
            <HeaderSubtitle>
              {isAdmin ? 'Admin Dashboard - Manage orders and track pickups' : 'Mobile Restaurant Management'}
            </HeaderSubtitle>
          </HeaderInfo>
          <HeaderNav role="navigation" aria-label="Main navigation">
            {isAuthenticated ? (
              <>
                <UserInfo aria-label="Current user">
                  <User size={16} aria-hidden="true" />
                  <span>{session.user?.name || session.user?.email}</span>
                </UserInfo>

                {!isAdmin && (
                  <Link href="/admin" style={{ textDecoration: 'none' }}>
                    <ActionButton $variant="primary" as="div" style={{ cursor: 'pointer' }}>
                      <Home size={16} aria-hidden="true" />
                      Dashboard
                    </ActionButton>
                  </Link>
                )}

                {isAdmin && (
                  <ActionButton
                    $variant="primary"
                    onClick={handleRefresh}
                    aria-label="Refresh page"
                  >
                    <RefreshCw size={16} aria-hidden="true" />
                    Refresh
                  </ActionButton>
                )}

                <ActionButton
                  $variant="danger"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Sign Out
                </ActionButton>
              </>
            ) : (
              <>
                <Link href="/auth/signin" style={{ textDecoration: 'none' }}>
                  <ActionButton $variant="primary" as="div" style={{ cursor: 'pointer' }}>
                    Sign In
                  </ActionButton>
                </Link>
                <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                  <ActionButton $variant="primary" as="div" style={{ cursor: 'pointer', background: '#16a34a' }}>
                    Sign Up
                  </ActionButton>
                </Link>
              </>
            )}
          </HeaderNav>
        </HeaderContent>
      </HeaderWrapper>
    </HeaderContainer>
  );
};

export default Header;