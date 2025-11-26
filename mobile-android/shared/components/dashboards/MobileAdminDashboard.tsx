'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Bell,
  FileText,
  MapPin,
  CreditCard,
  Shield,
  Activity,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  UtensilsCrossed
} from 'lucide-react'

// Mock data for demonstration
const mockAdminData = {
  systemOverview: {
    totalUsers: 1247,
    activeOrders: 38,
    totalRevenue: 45320.50,
    systemHealth: 98
  },
  todayStats: {
    newUsers: 12,
    completedOrders: 142,
    revenue: 3245.80,
    avgOrderValue: 22.85
  },
  recentActivity: [
    { id: '1', type: 'order', message: 'New order #1045 created', time: '2 min ago', status: 'info' },
    { id: '2', type: 'user', message: 'New user registration: John D.', time: '5 min ago', status: 'success' },
    { id: '3', type: 'payment', message: 'Payment received: $48.50', time: '8 min ago', status: 'success' },
    { id: '4', type: 'alert', message: 'Low inventory alert: Jerk Sauce', time: '15 min ago', status: 'warning' },
    { id: '5', type: 'order', message: 'Order #1043 delivered', time: '22 min ago', status: 'success' }
  ],
  alerts: [
    { id: '1', type: 'warning', message: '3 orders pending driver assignment', priority: 'high' },
    { id: '2', type: 'info', message: 'System backup scheduled for tonight', priority: 'low' },
    { id: '3', type: 'warning', message: '2 drivers on break', priority: 'medium' }
  ],
  quickStats: {
    ordersToday: 142,
    ordersThisWeek: 856,
    ordersThisMonth: 3402,
    avgDeliveryTime: '28 min',
    customerSatisfaction: 4.8,
    activeDrivers: 24
  }
}

export default function MobileAdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(mockAdminData)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-orange-600'
      case 'error':
        return 'text-red-600'
      case 'info':
      default:
        return 'text-blue-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />
      case 'warning':
        return <AlertCircle className="w-4 h-4" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      case 'info':
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-orange-100 text-orange-700'
      case 'low':
      default:
        return 'bg-blue-100 text-blue-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center pb-[120px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Shield className="w-12 h-12 text-[#ed7734]" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pb-[120px]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ed7734] to-orange-600 bg-clip-text text-transparent mb-1">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-600">System Overview & Management</p>
      </div>

      {/* System Overview Cards */}
      <div className="p-4">
        <h2 className="text-sm font-bold text-gray-600 uppercase mb-3">System Overview</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-700" />
              <p className="text-xs text-blue-700 font-medium">Total Users</p>
            </div>
            <p className="text-3xl font-bold text-blue-900">{data.systemOverview.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">+{data.todayStats.newUsers} today</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-700" />
              <p className="text-xs text-green-700 font-medium">Total Revenue</p>
            </div>
            <p className="text-3xl font-bold text-green-900">${(data.systemOverview.totalRevenue / 1000).toFixed(1)}k</p>
            <p className="text-xs text-green-600 mt-1">${data.todayStats.revenue} today</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-orange-700" />
              <p className="text-xs text-orange-700 font-medium">Active Orders</p>
            </div>
            <p className="text-3xl font-bold text-orange-900">{data.systemOverview.activeOrders}</p>
            <p className="text-xs text-orange-600 mt-1">{data.todayStats.completedOrders} completed today</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-orange-700" />
              <p className="text-xs text-orange-700 font-medium">System Health</p>
            </div>
            <p className="text-3xl font-bold text-orange-900">{data.systemOverview.systemHealth}%</p>
            <p className="text-xs text-orange-600 mt-1">All systems operational</p>
          </motion.div>
        </div>

        {/* Alerts */}
        {data.alerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-600 uppercase mb-3">System Alerts</h2>
            <div className="space-y-2">
              {data.alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg border-l-4 border-orange-500 p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                      <p className="text-sm text-gray-900">{alert.message}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityBadge(alert.priority)}`}>
                      {alert.priority}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-600 uppercase mb-3">Quick Stats</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Orders Today</p>
                <p className="text-2xl font-bold text-gray-900">{data.quickStats.ordersToday}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{data.quickStats.ordersThisWeek}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{data.quickStats.ordersThisMonth}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Avg Delivery</p>
                <p className="text-2xl font-bold text-gray-900">{data.quickStats.avgDeliveryTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Satisfaction</p>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <p className="text-2xl font-bold text-gray-900">{data.quickStats.customerSatisfaction}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Active Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{data.quickStats.activeDrivers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-600 uppercase mb-3">Management</h2>
          <div className="space-y-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/mobile/admin/analytics')}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Analytics</p>
                  <p className="text-xs text-gray-500">View detailed reports</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/mobile/admin/users')}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">User Management</p>
                  <p className="text-xs text-gray-500">Manage all users & roles</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/mobile/admin/orders')}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Order Management</p>
                  <p className="text-xs text-gray-500">View & manage all orders</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/mobile/admin/menu')}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-amber-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Menu Management</p>
                  <p className="text-xs text-gray-500">Manage food items & categories</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/mobile/settings/billing')}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Billing & Plans</p>
                  <p className="text-xs text-gray-500">Manage subscriptions</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/mobile/settings/locations')}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-red-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Locations</p>
                  <p className="text-xs text-gray-500">Manage delivery zones</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/mobile/settings')}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-700" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">System Settings</p>
                  <p className="text-xs text-gray-500">Configure system</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-600 uppercase mb-3">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="space-y-3">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <div className={`mt-1 ${getStatusColor(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
