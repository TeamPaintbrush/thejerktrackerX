'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import { 
  User, 
  Bell, 
  Lock, 
  BarChart3, 
  CreditCard, 
  MapPin, 
  LogOut, 
  ChevronRight,
  Settings as SettingsIcon,
  Palette,
  Home,
  Package
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const MotionLink = motion(Link)

const PageContainer = styled.div`
  min-height: 100vh;
  background: #fafaf9;
`;

const TopNavBar = styled.header`
  background: white;
  border-bottom: 2px solid #e7e5e4;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const NavContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
`;

const LogoIcon = styled.div`
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(237, 119, 52, 0.3);
`;

const LogoText = styled.div`
  h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1c1917;
    margin: 0;
    line-height: 1.2;
  }
  
  p {
    font-size: 0.75rem;
    color: #78716c;
    margin: 0;
    line-height: 1;
  }
`;

const NavMenu = styled.nav`
  display: none;
  
  @media (min-width: 1024px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavItem = styled.li`
  display: inline-flex;
`;

const NavButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background: ${props => props.$active ? 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#44403c'};
  text-decoration: none;
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)' : '#f5f5f4'};
    color: ${props => props.$active ? 'white' : '#1c1917'};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  border: none;
  background: #f5f5f4;
  color: #1c1917;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e7e5e4;
  }
`;

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('settings')

  type SettingsItem = {
    id: string
    title: string
    description: string
    icon: LucideIcon
    iconBg: string
    iconColor: string
    badge?: string
    href?: string
    onClick?: () => void
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: () => router.push('/admin') },
    { id: 'orders', label: 'Orders', icon: Package, onClick: () => router.push('/admin') },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ]

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut({ callbackUrl: '/' })
    }
  }

  const settingsItems: SettingsItem[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Manage your account information',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      href: '/settings/profile'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure notification preferences',
      icon: Bell,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      href: '/settings/notifications'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Manage password and privacy settings',
      icon: Lock,
      color: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      href: '/settings/security'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View your analytics dashboard',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      href: '/settings/analytics'
    },
    {
      id: 'billing',
      title: 'Billing & Plans',
      description: 'Manage subscriptions and payments',
      icon: CreditCard,
      color: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      href: '/settings/billing'
    },
    {
      id: 'branding',
      title: 'Business Branding',
      description: 'Customize logo, colors, and QR codes',
      icon: Palette,
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      href: '/settings/branding',
      badge: 'Professional+'
    },
    {
      id: 'locations',
      title: 'Locations',
      description: 'Manage delivery zones and locations',
      icon: MapPin,
      color: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      href: '/settings/locations'
    },
    {
      id: 'logout',
      title: 'Sign Out',
      description: 'Sign out of your account',
      icon: LogOut,
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      onClick: handleSignOut
    }
  ]

  return (
    <PageContainer>
      <TopNavBar>
        <NavContainer>
          <NavLeft>
            <Logo href="/">
              <LogoIcon>JT</LogoIcon>
              <LogoText>
                <h1>TheJERKTracker</h1>
                <p>Settings</p>
              </LogoText>
            </Logo>
            <NavMenu>
              <NavList>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavItem key={item.id}>
                      <NavButton 
                        $active={activeTab === item.id}
                        onClick={item.onClick || (() => setActiveTab(item.id))}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </NavButton>
                    </NavItem>
                  );
                })}
              </NavList>
            </NavMenu>
          </NavLeft>
          <NavRight>
            <UserButton onClick={handleSignOut}>
              <User size={18} />
              <span>{session?.user?.email || 'User'}</span>
            </UserButton>
          </NavRight>
        </NavContainer>
      </TopNavBar>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        {/* Page Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and application settings</p>
          </div>

          {/* Settings Grid - Improved Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settingsItems.map((item, index) => {
              const IconComponent = item.icon
              const cardClasses = "bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-gray-200 hover:border-[#ed7734] transition-all duration-200 text-left group relative"

              const content = (
                <>
                  {item.badge && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#ed7734] to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {item.badge}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#ed7734] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                  </div>
                </>
              )

              if (item.href) {
                return (
                  <MotionLink
                    key={item.id}
                    href={item.href}
                    className={cardClasses}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {content}
                  </MotionLink>
                )
              }

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cardClasses}
                >
                  {content}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
