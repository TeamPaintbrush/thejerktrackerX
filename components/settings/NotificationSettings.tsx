'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell,
  Smartphone,
  Mail,
  MessageSquare,
  Package,
  Truck,
  Star,
  DollarSign
} from 'lucide-react'
import SettingsService, { type UserSettings } from '../../lib/settings'

export default function NotificationSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    promotions: false,
    newsletter: false
  })

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const mockSettings = SettingsService.createDefaultSettings('user@example.com', 'user@example.com')
      setSettings(mockSettings)
      setNotifications(mockSettings.notifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    
    setSaving(true)
    try {
      await SettingsService.updateUserSettings('user@example.com', {
        notifications: updated,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed7734]"></div>
      </div>
    )
  }

  const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-[#ed7734]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
              <p className="text-gray-600 mt-1">Configure how you receive notifications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Channels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#ed7734]" />
            Notification Channels
          </h2>
          <p className="text-sm text-gray-600 mb-6">Choose how you want to be notified</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Receive notifications on this device</p>
                </div>
              </div>
              <Toggle enabled={notifications.push} onChange={() => handleToggle('push')} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
              </div>
              <Toggle enabled={notifications.email} onChange={() => handleToggle('email')} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                  <p className="text-sm text-gray-600">Receive text messages for important updates</p>
                </div>
              </div>
              <Toggle enabled={notifications.sms} onChange={() => handleToggle('sms')} />
            </div>
          </div>
        </motion.div>

        {/* Notification Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-md border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#ed7734]" />
            Notification Types
          </h2>
          <p className="text-sm text-gray-600 mb-6">Select which notifications you want to receive</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Order Updates</h3>
                  <p className="text-sm text-gray-600">Status changes, delivery updates, and confirmations</p>
                </div>
              </div>
              <Toggle enabled={notifications.orderUpdates} onChange={() => handleToggle('orderUpdates')} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Promotions</h3>
                  <p className="text-sm text-gray-600">Special offers, discounts, and promotions</p>
                </div>
              </div>
              <Toggle enabled={notifications.promotions} onChange={() => handleToggle('promotions')} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Newsletter</h3>
                  <p className="text-sm text-gray-600">Weekly updates and company news</p>
                </div>
              </div>
              <Toggle enabled={notifications.newsletter} onChange={() => handleToggle('newsletter')} />
            </div>
          </div>
        </motion.div>

        {saving && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ed7734]"></div>
              Saving...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
