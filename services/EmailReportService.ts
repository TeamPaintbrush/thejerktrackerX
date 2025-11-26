import { DynamoDBService, Order, Location } from '@/lib/dynamodb';
import { SES } from '@aws-sdk/client-ses';

// AWS SES Configuration
const sesClient = new SES({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export interface EmailReportOptions {
  recipientEmail: string;
  businessId: string;
  reportType: 'daily' | 'weekly' | 'monthly';
  startDate?: Date;
  endDate?: Date;
}

export interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  completionRate: number;
  locationBreakdown: {
    locationId: string;
    locationName: string;
    orders: number;
    revenue: number;
  }[];
  topItems: {
    item: string;
    count: number;
  }[];
}

class EmailReportService {
  private fromEmail = process.env.NEXT_PUBLIC_SENDER_EMAIL || 'noreply@jerktrackerx.com';

  /**
   * Generate and send daily report
   */
  async sendDailyReport(businessId: string, recipientEmail: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.sendReport({
      recipientEmail,
      businessId,
      reportType: 'daily',
      startDate: today,
      endDate: tomorrow
    });
  }

  /**
   * Generate and send weekly report
   */
  async sendWeeklyReport(businessId: string, recipientEmail: string): Promise<boolean> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return this.sendReport({
      recipientEmail,
      businessId,
      reportType: 'weekly',
      startDate: weekAgo,
      endDate: today
    });
  }

  /**
   * Generate and send monthly report
   */
  async sendMonthlyReport(businessId: string, recipientEmail: string): Promise<boolean> {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return this.sendReport({
      recipientEmail,
      businessId,
      reportType: 'monthly',
      startDate: monthAgo,
      endDate: today
    });
  }

  /**
   * Main report generation and sending method
   */
  async sendReport(options: EmailReportOptions): Promise<boolean> {
    try {
      // Generate report data
      const reportData = await this.generateReportData(options);

      // Generate HTML email
      const htmlContent = this.generateEmailHTML(reportData, options);

      // Generate plain text version
      const textContent = this.generateEmailText(reportData, options);

      // Send email via AWS SES
      const params = {
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [options.recipientEmail]
        },
        Message: {
          Subject: {
            Data: this.getSubject(options.reportType),
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: htmlContent,
              Charset: 'UTF-8'
            },
            Text: {
              Data: textContent,
              Charset: 'UTF-8'
            }
          }
        }
      };

      await sesClient.sendEmail(params);
      
      console.log(`${options.reportType} report sent to ${options.recipientEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending email report:', error);
      return false;
    }
  }

  /**
   * Generate report data from orders
   */
  private async generateReportData(options: EmailReportOptions): Promise<ReportData> {
    const { businessId, startDate, endDate } = options;

    // Fetch all orders
    const allOrders = await DynamoDBService.getAllOrders();

    // Filter by business and date range
    const filteredOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const matchesBusiness = order.location?.businessId === businessId;
      const withinDateRange = startDate && endDate 
        ? orderDate >= startDate && orderDate < endDate
        : true;
      
      return matchesBusiness && withinDateRange;
    });

    // Calculate metrics
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => 
      sum + (parseFloat(order.totalAmount) || 0), 0
    );
    const completedOrders = filteredOrders.filter(o => 
      o.status === 'delivered' || o.status === 'picked_up'
    ).length;
    const pendingOrders = filteredOrders.filter(o => 
      o.status === 'pending'
    ).length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Get locations
    const locations = await DynamoDBService.getLocationsByBusinessId(businessId);

    // Location breakdown
    const locationBreakdown = locations.map(location => {
      const locationOrders = filteredOrders.filter(o => 
        o.location?.locationId === location.id
      );
      const locationRevenue = locationOrders.reduce((sum, order) => 
        sum + (parseFloat(order.totalAmount) || 0), 0
      );

      return {
        locationId: location.id,
        locationName: location.name,
        orders: locationOrders.length,
        revenue: locationRevenue
      };
    }).filter(l => l.orders > 0);

    // Top items analysis
    const itemCounts = new Map<string, number>();
    filteredOrders.forEach(order => {
      const items = order.orderDetails.split(',').map(i => i.trim());
      items.forEach(item => {
        itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
      });
    });

    const topItems = Array.from(itemCounts.entries())
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      completedOrders,
      pendingOrders,
      averageOrderValue,
      completionRate,
      locationBreakdown,
      topItems
    };
  }

  /**
   * Generate HTML email content
   */
  private generateEmailHTML(data: ReportData, options: EmailReportOptions): string {
    const { reportType } = options;
    const periodText = this.getPeriodText(reportType);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #fafaf9;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 8px 0 0 0;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .metric-card {
      background: #fafaf9;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #ed7734;
      margin-bottom: 4px;
    }
    .metric-label {
      font-size: 14px;
      color: #78716c;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1c1917;
      margin-bottom: 12px;
    }
    .location-item {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: #fafaf9;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    .item-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .item-list li {
      padding: 8px 12px;
      background: #fafaf9;
      border-radius: 6px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #78716c;
      font-size: 12px;
      border-top: 1px solid #e7e5e4;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 ${periodText} Business Report</h1>
      <p>TheJERKTracker X - Order Analytics</p>
    </div>
    
    <div class="content">
      <div class="metrics">
        <div class="metric-card">
          <div class="metric-value">$${data.totalRevenue.toFixed(2)}</div>
          <div class="metric-label">Total Revenue</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.totalOrders}</div>
          <div class="metric-label">Total Orders</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">$${data.averageOrderValue.toFixed(2)}</div>
          <div class="metric-label">Avg Order Value</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.completionRate.toFixed(1)}%</div>
          <div class="metric-label">Completion Rate</div>
        </div>
      </div>

      ${data.locationBreakdown.length > 0 ? `
      <div class="section">
        <div class="section-title">📍 Location Performance</div>
        ${data.locationBreakdown.map(location => `
          <div class="location-item">
            <div>
              <strong>${location.locationName}</strong><br>
              <small>${location.orders} orders</small>
            </div>
            <div style="text-align: right;">
              <strong style="color: #ed7734;">$${location.revenue.toFixed(2)}</strong>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${data.topItems.length > 0 ? `
      <div class="section">
        <div class="section-title">🔥 Top Selling Items</div>
        <ul class="item-list">
          ${data.topItems.map(item => `
            <li>
              <span>${item.item}</span>
              <strong>${item.count} orders</strong>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">📦 Order Status</div>
        <div style="display: flex; gap: 12px;">
          <div style="flex: 1; text-align: center; padding: 12px; background: #dcfce7; border-radius: 6px;">
            <strong style="color: #16a34a; font-size: 20px;">${data.completedOrders}</strong><br>
            <small>Completed</small>
          </div>
          <div style="flex: 1; text-align: center; padding: 12px; background: #fef3c7; border-radius: 6px;">
            <strong style="color: #d97706; font-size: 20px;">${data.pendingOrders}</strong><br>
            <small>Pending</small>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>This is an automated report from TheJERKTracker X</p>
      <p>© 2025 TheJERKTracker X. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text email content
   */
  private generateEmailText(data: ReportData, options: EmailReportOptions): string {
    const { reportType } = options;
    const periodText = this.getPeriodText(reportType);

    let text = `${periodText} BUSINESS REPORT\n`;
    text += `TheJERKTracker X - Order Analytics\n\n`;
    text += `═══════════════════════════════════════\n\n`;
    text += `KEY METRICS\n`;
    text += `Total Revenue: $${data.totalRevenue.toFixed(2)}\n`;
    text += `Total Orders: ${data.totalOrders}\n`;
    text += `Average Order Value: $${data.averageOrderValue.toFixed(2)}\n`;
    text += `Completion Rate: ${data.completionRate.toFixed(1)}%\n\n`;

    if (data.locationBreakdown.length > 0) {
      text += `LOCATION PERFORMANCE\n`;
      data.locationBreakdown.forEach(location => {
        text += `${location.locationName}: ${location.orders} orders, $${location.revenue.toFixed(2)}\n`;
      });
      text += `\n`;
    }

    if (data.topItems.length > 0) {
      text += `TOP SELLING ITEMS\n`;
      data.topItems.forEach((item, index) => {
        text += `${index + 1}. ${item.item}: ${item.count} orders\n`;
      });
      text += `\n`;
    }

    text += `ORDER STATUS\n`;
    text += `Completed: ${data.completedOrders}\n`;
    text += `Pending: ${data.pendingOrders}\n\n`;
    text += `═══════════════════════════════════════\n`;
    text += `This is an automated report from TheJERKTracker X\n`;

    return text;
  }

  /**
   * Get email subject based on report type
   */
  private getSubject(reportType: string): string {
    const periodText = this.getPeriodText(reportType);
    return `📊 ${periodText} Business Report - TheJERKTracker X`;
  }

  /**
   * Get period text for report type
   */
  private getPeriodText(reportType: string): string {
    switch (reportType) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return 'Business';
    }
  }

  /**
   * Schedule automated reports (call this from cron job or scheduled task)
   */
  async scheduleReports(): Promise<void> {
    // This would typically be called by a cron job or serverless function
    // For now, it's a placeholder showing the pattern
    console.log('Email report scheduling would be implemented here');
    
    // Example: Send daily reports every morning at 8 AM
    // Example: Send weekly reports every Monday at 9 AM
    // Example: Send monthly reports on the 1st of each month
  }
}

// Export singleton instance
export const emailReportService = new EmailReportService();

export default emailReportService;
