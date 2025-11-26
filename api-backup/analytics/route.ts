import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBService, Order, User, Location } from '@/lib/dynamodb';

/**
 * GET /api/analytics - Get analytics data
 * Returns real-time statistics calculated from database
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all data in parallel for better performance
    const [orders, users] = await Promise.all([
      DynamoDBService.getAllOrders(),
      DynamoDBService.getAllUsers()
    ]);

    // Note: Locations will be added when getAllLocations() method is implemented
    const locations: Location[] = [];

    // Calculate date ranges
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Filter orders by date
    const ordersLast30Days = orders.filter((order: Order) => 
      new Date(order.createdAt) >= last30Days
    );
    const ordersLast60Days = orders.filter((order: Order) => 
      new Date(order.createdAt) >= last60Days && 
      new Date(order.createdAt) < last30Days
    );

    // Calculate metrics
    const totalOrders = orders.length;
    const ordersThisMonth = ordersLast30Days.length;
    const ordersLastMonth = ordersLast60Days.length;
    const ordersChange = ordersLastMonth > 0 
      ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100).toFixed(1)
      : '+100.0';

    // TODO: Add total field to Order interface for accurate revenue calculation
    // For now, using average estimated order value of $25
    const avgEstimatedOrderValue = 25;
    const totalRevenue = orders.length * avgEstimatedOrderValue;
    const revenueThisMonth = ordersLast30Days.length * avgEstimatedOrderValue;
    const revenueLastMonth = ordersLast60Days.length * avgEstimatedOrderValue;
    const revenueChange = revenueLastMonth > 0
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
      : '+100.0';

    const totalCustomers = users.filter((u: User) => u.role === 'customer').length;
    const newCustomersThisMonth = users.filter((u: User) => 
      u.role === 'customer' && new Date(u.createdAt) >= last30Days
    ).length;
    const newCustomersLastMonth = users.filter((u: User) => 
      u.role === 'customer' && 
      new Date(u.createdAt) >= last60Days && 
      new Date(u.createdAt) < last30Days
    ).length;
    const customersChange = newCustomersLastMonth > 0
      ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth * 100).toFixed(1)
      : '+100.0';

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 
      ? (totalRevenue / totalOrders).toFixed(2)
      : '0.00';

    // Calculate completion time (orders with delivered status)
    const deliveredOrders = orders.filter((o: Order) => o.status === 'delivered');
    const totalCompletionTime = deliveredOrders.reduce((sum: number, order: Order) => {
      if (order.deliveredAt && order.createdAt) {
        const diff = new Date(order.deliveredAt).getTime() - new Date(order.createdAt).getTime();
        return sum + diff;
      }
      return sum;
    }, 0);
    const avgCompletionMinutes = deliveredOrders.length > 0
      ? Math.round((totalCompletionTime / deliveredOrders.length) / 60000)
      : 0;

    // Order status breakdown
    const statusCounts = orders.reduce((acc: Record<string, number>, order: Order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Orders by day (last 7 days)
    const ordersByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const count = orders.filter((order: Order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      }).length;

      return {
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: count
      };
    }).reverse();

    // Revenue by day (last 7 days)
    const revenueByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const revenue = orders
        .filter((order: Order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= dayStart && orderDate <= dayEnd;
        }).length * avgEstimatedOrderValue;

      return {
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: revenue
      };
    }).reverse();

    // Top performing locations (using locationId from orders)
    const locationIdCounts: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach((order: Order) => {
      const locId = order.location?.locationId || 'unknown';
      if (!locationIdCounts[locId]) {
        locationIdCounts[locId] = { orders: 0, revenue: 0 };
      }
      locationIdCounts[locId].orders++;
      locationIdCounts[locId].revenue += avgEstimatedOrderValue;
    });

    const locationStats = Object.entries(locationIdCounts)
      .map(([locationId, stats]) => ({
        id: locationId,
        name: `Location ${locationId.substring(0, 8)}`, // TODO: Get actual location names when locations are implemented
        orders: stats.orders,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Active drivers
    const activeDrivers = users.filter((u: User) => 
      u.role === 'driver' && 
      u.driverInfo?.availability === 'available'
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalOrders,
          ordersThisMonth,
          ordersChange: parseFloat(ordersChange),
          totalRevenue,
          revenueThisMonth,
          revenueChange: parseFloat(revenueChange),
          totalCustomers,
          newCustomersThisMonth,
          customersChange: parseFloat(customersChange),
          avgOrderValue: parseFloat(avgOrderValue),
          avgCompletionMinutes,
          activeDrivers,
          totalLocations: locations.length
        },
        charts: {
          statusCounts,
          ordersByDay,
          revenueByDay,
          locationStats
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
