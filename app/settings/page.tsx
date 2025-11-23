'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Lock, 
  BarChart3, 
  CreditCard, 
  MapPin, 
  LogOut, 
  ArrowRight,
  Settings as SettingsIcon,
  Palette
} from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    })
  }

  const settingsItems = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Manage your account information',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      onClick: () => router.push('/settings/profile')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure notification preferences',
      icon: Bell,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      onClick: () => router.push('/settings/notifications')
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Manage password and privacy settings',
      icon: Lock,
      color: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      onClick: () => router.push('/settings/security')
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View your analytics dashboard',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      onClick: () => router.push('/settings/analytics')
    },
    {
      id: 'billing',
      title: 'Billing & Plans',
      description: 'Manage subscriptions and payments',
      icon: CreditCard,
      color: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      onClick: () => router.push('/settings/billing')
    },
    {
      id: 'branding',
      title: 'Business Branding',
      description: 'Customize logo, colors, and QR codes',
      icon: Palette,
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      onClick: () => router.push('/settings/branding'),
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
      onClick: () => router.push('/settings/locations')
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#ed7734] to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ed7734] to-orange-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600 mt-1">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsItems.map((item, index) => {
            const IconComponent = item.icon
            
            return (
              <motion.button
                key={item.id}
                onClick={item.onClick}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-200 transition-all duration-200 text-left group relative"
              >
                {item.badge && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-[#ed7734] to-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.badge}
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className={`w-7 h-7 ${item.iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-between">
                      {item.title}
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#ed7734] group-hover:translate-x-1 transition-all duration-200" />
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-md border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                If you have questions about any of these settings, check out our help documentation or contact support.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-gradient-to-r from-[#ed7734] to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow">
                  View Documentation
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
