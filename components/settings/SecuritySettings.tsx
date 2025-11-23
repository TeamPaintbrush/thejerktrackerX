'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Lock,
  Shield,
  Key,
  Smartphone,
  History,
  Eye,
  EyeOff,
  Check,
  AlertTriangle
} from 'lucide-react'
import SettingsService, { type UserSettings } from '../../lib/settings'

export default function SecuritySettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadSecurity()
  }, [])

  const loadSecurity = async () => {
    try {
      const mockSettings = SettingsService.createDefaultSettings('user@example.com', 'user@example.com')
      setSettings(mockSettings)
      setSecurity(mockSettings.security)
    } catch (error) {
      console.error('Failed to load security:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle2FA = async () => {
    const updated = { ...security, twoFactorEnabled: !security.twoFactorEnabled }
    setSecurity(updated)
    
    setSaving(true)
    try {
      await SettingsService.updateUserSettings('user@example.com', {
        security: updated,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSessionTimeoutChange = async (timeout: number) => {
    const updated = { ...security, sessionTimeout: timeout }
    setSecurity(updated)
    
    setSaving(true)
    try {
      await SettingsService.updateUserSettings('user@example.com', {
        security: updated,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    setSaving(true)
    try {
      // In production, this would call the password change API
      console.log('Password change requested')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Password changed successfully')
    } catch (error) {
      console.error('Failed to change password:', error)
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
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security & Privacy</h1>
              <p className="text-gray-600 mt-1">Manage your account security settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Password Change */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#ed7734]" />
            Change Password
          </h2>
          <p className="text-sm text-gray-600 mb-6">Update your password to keep your account secure</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed7734] focus:border-transparent"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed7734] focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed7734] focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
              className="w-full px-4 py-3 bg-gradient-to-r from-[#ed7734] to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              Update Password
            </button>
          </div>
        </motion.div>

        {/* Two-Factor Authentication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#ed7734]" />
            Two-Factor Authentication
          </h2>
          <p className="text-sm text-gray-600 mb-6">Add an extra layer of security to your account</p>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-900">Enable 2FA</h3>
                <p className="text-sm text-gray-600">
                  {security.twoFactorEnabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Protect your account with two-factor authentication'
                  }
                </p>
              </div>
            </div>
            <Toggle enabled={security.twoFactorEnabled} onChange={handleToggle2FA} />
          </div>

          {security.twoFactorEnabled && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">2FA is enabled</p>
                <p className="text-sm text-green-700 mt-1">
                  You&apos;ll need to verify your identity with a code from your authenticator app when signing in.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Session Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-md border border-gray-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <History className="w-5 h-5 text-[#ed7734]" />
            Session Management
          </h2>
          <p className="text-sm text-gray-600 mb-6">Control how long you stay logged in</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Session Timeout
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[15, 30, 60, 120].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => handleSessionTimeoutChange(minutes)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    security.sessionTimeout === minutes
                      ? 'border-[#ed7734] bg-orange-50 text-[#ed7734] font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {minutes} min
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              You&apos;ll be automatically logged out after {security.sessionTimeout} minutes of inactivity.
            </p>
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
