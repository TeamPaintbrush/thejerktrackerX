'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface SettingsLayoutProps {
  title: string
  description: string
  icon: LucideIcon
  iconBgColor: string
  iconColor: string
  children: React.ReactNode
}

export default function SettingsLayout({
  title,
  description,
  icon: Icon,
  iconBgColor,
  iconColor,
  children
}: SettingsLayoutProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#ed7734] mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Settings</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${iconBgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
              <Icon className={`w-7 h-7 ${iconColor}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
