'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Package, 
  Truck, 
  MapPin, 
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  UserCheck,
  UserX,
  Activity
} from 'lucide-react'

// Mock data for demonstration
const mockManagerData = {
  teamStats: {
    activeDrivers: 12,
    totalDrivers: 18,
    averageRating: 4.7,
    onTimeDeliveryRate: 94
  },
  todayStats: {
    totalOrders: 45,
    assignedOrders: 38,
    pendingOrders: 7,
    completedOrders: 31,
    totalRevenue: 1245.50
  },
  activeDrivers: [
    {
      id: '1',
      name: 'John Smith',
      status: 'delivering',
      currentOrders: 2,
      completedToday: 8,
      rating: 4.9,
      location: 'Downtown Area'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      status: 'available',
      currentOrders: 0,
      completedToday: 6,
      rating: 4.8,
      location: 'North District'
    },
    {
      id: '3',
      name: 'Mike Davis',
      status: 'delivering',
      currentOrders: 1,
      completedToday: 7,
      rating: 4.7,
      location: 'East Side'
    },
    {
      id: '4',
      name: 'Emily Wilson',
      status: 'on_break',
      currentOrders: 0,
      completedToday: 5,
      rating: 4.9,
      location: 'West End'
    }
  ],
  pendingAssignments: [
    {
      id: '1001',
      customer: 'Restaurant ABC',
      items: 'Caribbean Jerk Chicken Platter × 2',
      pickup: '123 Main St',
      delivery: '456 Oak Ave',
      priority: 'high',
      estimatedTime: '30 min',
      distance: '2.5 mi'
    },
    {
      id: '1002',
      customer: 'Café XYZ',
      items: 'Jerk Pork Bowl × 1, Plantains × 1',
      pickup: '789 Pine St',
      delivery: '321 Elm St',
      priority: 'medium',
      estimatedTime: '25 min',
      distance: '1.8 mi'
    },
    {
      id: '1003',
      customer: 'Food Court',
      items: 'Jerk Wings × 3',
      pickup: '555 Maple Dr',
      delivery: '777 Cedar Ln',
      priority: 'low',
      estimatedTime: '35 min',
      distance: '3.2 mi'
    }
  ],
  performanceMetrics: {
    weeklyOrders: [32, 45, 38, 52, 48, 45, 41],
    weeklyRevenue: [890, 1245, 1050, 1480, 1320, 1245, 1100],
    driverPerformance: [
      { name: 'John', deliveries: 42, rating: 4.9 },
      { name: 'Sarah', deliveries: 38, rating: 4.8 },
      { name: 'Mike', deliveries: 35, rating: 4.7 },
      { name: 'Emily', deliveries: 33, rating: 4.9 }
    ]
  }
}

export default function MobileManagerDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(mockManagerData)
  const [selectedView, setSelectedView] = useState<'team' | 'assignments' | 'performance'>('team')

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivering':
        return 'bg-blue-100 text-blue-700'
      case 'available':
        return 'bg-green-100 text-green-700'
      case 'on_break':
        return 'bg-yellow-100 text-yellow-700'
      case 'offline':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivering':
        return <Truck className="w-3 h-3" />
      case 'available':
        return <UserCheck className="w-3 h-3" />
      case 'on_break':
        return <Clock className="w-3 h-3" />
      case 'offline':
        return <UserX className="w-3 h-3" />
      default:
        return <Activity className="w-3 h-3" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50'
      case 'medium':
        return 'border-orange-500 bg-orange-50'
      case 'low':
        return 'border-gray-300 bg-gray-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const assignOrder = (orderId: string, driverId: string) => {
    console.log(`Assigning order ${orderId} to driver ${driverId}`)
    // In real app, this would call API
    alert(`Order ${orderId} assigned successfully!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center pb-[120px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Users className="w-12 h-12 text-[#ed7734]" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pb-[120px]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ed7734] to-orange-600 bg-clip-text text-transparent mb-4">
          Manager Dashboard
        </h1>

        {/* Today's Overview Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-blue-700" />
              <p className="text-xs text-blue-700 font-medium">Today's Orders</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">{data.todayStats.totalOrders}</p>
            <p className="text-xs text-blue-600">{data.todayStats.completedOrders} completed</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-700" />
              <p className="text-xs text-green-700 font-medium">Revenue</p>
            </div>
            <p className="text-2xl font-bold text-green-900">${data.todayStats.totalRevenue}</p>
            <p className="text-xs text-green-600">Today's earnings</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-700" />
              <p className="text-xs text-purple-700 font-medium">Active Drivers</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">{data.teamStats.activeDrivers}</p>
            <p className="text-xs text-purple-600">of {data.teamStats.totalDrivers} total</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-700" />
              <p className="text-xs text-orange-700 font-medium">On-Time Rate</p>
            </div>
            <p className="text-2xl font-bold text-orange-900">{data.teamStats.onTimeDeliveryRate}%</p>
            <p className="text-xs text-orange-600">Delivery performance</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('team')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selectedView === 'team'
                ? 'bg-[#ed7734] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Team Status
          </button>
          <button
            onClick={() => setSelectedView('assignments')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selectedView === 'assignments'
                ? 'bg-[#ed7734] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setSelectedView('performance')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selectedView === 'performance'
                ? 'bg-[#ed7734] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Performance
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Team Status View */}
        {selectedView === 'team' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">Active Drivers</h2>
              <span className="text-sm text-gray-500">{data.activeDrivers.length} drivers</span>
            </div>

            {data.activeDrivers.map((driver) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{driver.name}</h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                        {getStatusIcon(driver.status)}
                        {driver.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {driver.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                    <span className="text-xs font-bold text-yellow-700">{driver.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-blue-600 mb-0.5">Current Orders</p>
                    <p className="text-lg font-bold text-blue-900">{driver.currentOrders}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-green-600 mb-0.5">Completed Today</p>
                    <p className="text-lg font-bold text-green-900">{driver.completedToday}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 py-2 bg-[#ed7734] text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                    Assign Order
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Assignments View */}
        {selectedView === 'assignments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">Pending Assignments</h2>
              <span className="text-sm text-gray-500">{data.pendingAssignments.length} orders</span>
            </div>

            {data.pendingAssignments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">All Orders Assigned!</h3>
                <p className="text-sm text-gray-500">No pending assignments at the moment.</p>
              </div>
            ) : (
              data.pendingAssignments.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl shadow-sm border-l-4 p-4 ${getPriorityColor(order.priority)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">#{order.id}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.priority === 'high' ? 'bg-red-100 text-red-700' :
                          order.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Distance</p>
                      <p className="text-sm font-bold text-gray-900">{order.distance}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-2">{order.items}</p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Pickup</p>
                          <p className="text-sm text-gray-900">{order.pickup}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Delivery</p>
                          <p className="text-sm text-gray-900">{order.delivery}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      Est. {order.estimatedTime}
                    </div>
                    <button
                      onClick={() => assignOrder(order.id, 'auto')}
                      className="flex items-center gap-1 px-4 py-2 bg-[#ed7734] text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                      Assign Driver
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Performance View */}
        {selectedView === 'performance' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Team Performance</h2>

            {/* Top Performers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-3">Top Performers This Week</h3>
              <div className="space-y-3">
                {data.performanceMetrics.driverPerformance.map((driver, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{driver.name}</p>
                        <p className="text-xs text-gray-500">{driver.deliveries} deliveries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                      <span className="text-sm font-bold text-yellow-700">{driver.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-3">Weekly Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Average Orders/Day</p>
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(data.performanceMetrics.weeklyOrders.reduce((a, b) => a + b, 0) / 7)}
                    </p>
                  </div>
                  <div className="flex gap-1 h-20 items-end">
                    {data.performanceMetrics.weeklyOrders.map((orders, index) => {
                      const maxOrders = Math.max(...data.performanceMetrics.weeklyOrders)
                      const height = (orders / maxOrders) * 100
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-gradient-to-t from-[#ed7734] to-orange-400 rounded-t"
                            style={{ height: `${height}%` }}
                          />
                          <p className="text-xs text-gray-500">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Average Revenue/Day</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${Math.round(data.performanceMetrics.weeklyRevenue.reduce((a, b) => a + b, 0) / 7)}
                    </p>
                  </div>
                  <div className="flex gap-1 h-20 items-end">
                    {data.performanceMetrics.weeklyRevenue.map((revenue, index) => {
                      const maxRevenue = Math.max(...data.performanceMetrics.weeklyRevenue)
                      const height = (revenue / maxRevenue) * 100
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                            style={{ height: `${height}%` }}
                          />
                          <p className="text-xs text-gray-500">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Team Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-blue-700" />
                  <p className="text-sm text-blue-700 font-medium">Avg Rating</p>
                </div>
                <p className="text-3xl font-bold text-blue-900">{data.teamStats.averageRating}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-700" />
                  <p className="text-sm text-green-700 font-medium">On-Time</p>
                </div>
                <p className="text-3xl font-bold text-green-900">{data.teamStats.onTimeDeliveryRate}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
