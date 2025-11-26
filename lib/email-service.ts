/**
 * 📧 Email Service for The JERK Tracker
 * 
 * Handles sending transactional emails via AWS SES
 * Currently in development mode - emails are logged to console
 * 
 * Production setup:
 * 1. Configure AWS SES in your AWS account
 * 2. Verify sender email domain
 * 3. Add SES credentials to environment variables
 * 4. Uncomment SES implementation below
 */

// import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

class EmailService {
  // private sesClient: SESClient;
  private fromEmail = 'noreply@jerktrackerx.com';
  private isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    // Production: Initialize AWS SES client
    // this.sesClient = new SESClient({
    //   region: process.env.AWS_REGION || 'us-east-1',
    //   credentials: {
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    //   },
    // });
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, name: string, role: string): Promise<boolean> {
    const template = this.getWelcomeEmailTemplate(name, role);

    if (this.isDevelopment) {
      console.log('📧 [DEV MODE] Welcome email would be sent to:', email);
      console.log('Subject:', template.subject);
      console.log('Body:', template.textBody);
      return true;
    }

    // Production: Send via AWS SES
    try {
      // const command = new SendEmailCommand({
      //   Source: this.fromEmail,
      //   Destination: { ToAddresses: [email] },
      //   Message: {
      //     Subject: { Data: template.subject },
      //     Body: {
      //       Html: { Data: template.htmlBody },
      //       Text: { Data: template.textBody },
      //     },
      //   },
      // });
      // await this.sesClient.send(command);
      console.log('✅ Welcome email sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Get welcome email template
   */
  private getWelcomeEmailTemplate(name: string, role: string): EmailTemplate {
    const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
    
    return {
      subject: '🎉 Welcome to The JERK Tracker!',
      htmlBody: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ed7734; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍗 Welcome to The JERK Tracker!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for creating an account with The JERK Tracker!</p>
              
              <p><strong>Your account details:</strong></p>
              <ul>
                <li>Email: ${name}</li>
                <li>Role: ${roleDisplay}</li>
              </ul>
              
              <p>Get started by exploring your dashboard and placing your first order!</p>
              
              <a href="https://thejerktracker0.vercel.app/mobile" class="button">Open Dashboard</a>
              
              <p>Need help? Our support team is here for you:</p>
              <p>📧 support@jerktrackerx.com</p>
              
              <p>Happy tracking!</p>
              <p><strong>The JERK Tracker Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} The JERK Tracker. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textBody: `
Hi ${name}! 👋

Thank you for creating an account with The JERK Tracker!

Your account details:
- Email: ${name}
- Role: ${roleDisplay}

Get started by exploring your dashboard and placing your first order!

Visit: https://thejerktracker0.vercel.app/mobile

Need help? Contact us at support@jerktrackerx.com

Happy tracking!
The JERK Tracker Team

© ${new Date().getFullYear()} The JERK Tracker. All rights reserved.
      `.trim(),
    };
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(email: string, orderNumber: string, orderDetails?: {
    customerName: string;
    items: string;
    total?: string;
    deliveryAddress?: string;
    estimatedDelivery?: string;
  }): Promise<boolean> {
    try {
      const template = {
        to: email,
        subject: `Order Confirmation - #${orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
              .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ed7734; }
              .footer { background: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
              .button { display: inline-block; padding: 12px 30px; background: #ed7734; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              h2 { color: #ed7734; margin-top: 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🎉 Order Confirmed!</h1>
                <p style="margin: 10px 0 0 0;">Thank you for your order</p>
              </div>
              <div class="content">
                <p>Hi ${orderDetails?.customerName || 'there'},</p>
                <p>Great news! Your order has been confirmed and is being prepared.</p>
                
                <div class="order-details">
                  <h2>Order Details</h2>
                  <p><strong>Order Number:</strong> ${orderNumber}</p>
                  <p><strong>Items:</strong> ${orderDetails?.items || 'See order details'}</p>
                  ${orderDetails?.total ? `<p><strong>Total:</strong> ${orderDetails.total}</p>` : ''}
                  ${orderDetails?.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress}</p>` : ''}
                  ${orderDetails?.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${orderDetails.estimatedDelivery}</p>` : ''}
                </div>
                
                <p>You'll receive updates as your order progresses:</p>
                <ul>
                  <li>✅ Order Confirmed (You are here)</li>
                  <li>📦 Order Picked Up by Driver</li>
                  <li>🚚 Out for Delivery</li>
                  <li>✨ Delivered</li>
                </ul>
                
                <p style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://thejerktrackerx.com'}/orders/${orderNumber}" class="button">Track Your Order</a>
                </p>
              </div>
              <div class="footer">
                <p>Need help? Contact us at support@jerktrackerx.com</p>
                <p>© ${new Date().getFullYear()} The JERK Tracker. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Order Confirmation - #${orderNumber}

Hi ${orderDetails?.customerName || 'there'},

Your order has been confirmed!

Order Details:
- Order Number: ${orderNumber}
- Items: ${orderDetails?.items || 'See order details'}
${orderDetails?.total ? `- Total: ${orderDetails.total}` : ''}
${orderDetails?.deliveryAddress ? `- Delivery Address: ${orderDetails.deliveryAddress}` : ''}

Track your order: ${process.env.NEXT_PUBLIC_APP_URL || 'https://thejerktrackerx.com'}/orders/${orderNumber}

Thank you for your order!
        `.trim()
      };

      console.log(`📧 Order confirmation email queued for ${email} - Order #${orderNumber}`);
      // In production, send via email service (SendGrid, SES, etc.)
      // await this.sendEmail(template);
      
      return true;
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetToken: string, userName?: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thejerktrackerx.com'}/auth/reset-password?token=${resetToken}`;
      
      const template = {
        to: email,
        subject: 'Password Reset Request - The JERK Tracker',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
              .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { background: #333; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; }
              .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .token-box { background: white; padding: 15px; margin: 20px 0; border: 2px dashed #ccc; border-radius: 8px; font-family: monospace; text-align: center; font-size: 16px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🔐 Password Reset</h1>
                <p style="margin: 10px 0 0 0;">Secure your account</p>
              </div>
              <div class="content">
                <p>Hi ${userName || 'there'},</p>
                <p>We received a request to reset your password for The JERK Tracker account.</p>
                
                <p style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Your Password</a>
                </p>
                
                <p style="text-align: center; color: #666; font-size: 14px;">
                  Or copy this link: <br>
                  <span style="word-break: break-all;">${resetUrl}</span>
                </p>
                
                <div class="alert-box">
                  <strong>⚠️ Security Notice:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>This link expires in <strong>1 hour</strong></li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Your password won't change until you create a new one</li>
                  </ul>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                  For security reasons, we can't send you your current password. 
                  Use the link above to create a new one.
                </p>
              </div>
              <div class="footer">
                <p>Need help? Contact us at support@jerktrackerx.com</p>
                <p>© ${new Date().getFullYear()} The JERK Tracker. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Password Reset Request

Hi ${userName || 'there'},

We received a request to reset your password.

Reset your password: ${resetUrl}

This link expires in 1 hour.

If you didn't request this, please ignore this email.

Need help? Contact support@jerktrackerx.com
        `.trim()
      };

      console.log(`📧 Password reset email queued for ${email}`);
      // In production, send via email service (SendGrid, SES, etc.)
      // await this.sendEmail(template);
      
      return true;
    } catch (error) {
      console.error('Error sending password reset:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
