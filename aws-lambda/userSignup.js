const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const bcrypt = require('bcryptjs');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const sesClient = new SESClient({ region: 'us-east-1' });

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body);
    const { email, password, name, role = 'customer' } = body;

    // Validation
    if (!email || !password || !name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Email, password, and name are required' 
        })
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Password must be at least 6 characters' 
        })
      };
    }

    // Check if user exists by scanning for email
    const existingUsers = await docClient.send(new ScanCommand({
      TableName: 'Users',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }));

    if (existingUsers.Items && existingUsers.Items.length > 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'User with this email already exists' 
        })
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate business ID and user ID
    const businessId = `BUS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create user (id is the primary key)
    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      role,
      businessId,
      platform: 'mobile',
      lastLoginPlatform: 'mobile',
      createdAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: 'Users',
      Item: newUser
    }));

    // Send welcome email via SES
    try {
      const emailParams = {
        Source: 'noreply@jerktrackerx.com',
        Destination: {
          ToAddresses: [email]
        },
        Message: {
          Subject: {
            Data: 'Welcome to The JERK Tracker! 🎉'
          },
          Body: {
            Html: {
              Data: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Welcome to The JERK Tracker!</h1>
                    </div>
                    <div class="content">
                      <h2>Hi ${name}! 👋</h2>
                      <p>Thank you for joining The JERK Tracker community! We're excited to have you on board.</p>
                      
                      <p>Your account has been successfully created and you're ready to start tracking your delicious jerk orders.</p>
                      
                      <p><strong>What's next?</strong></p>
                      <ul>
                        <li>📱 Access your dashboard on web or mobile</li>
                        <li>🍗 Start placing and tracking orders</li>
                        <li>📊 Monitor your order history</li>
                        <li>⭐ Rate your favorite jerk spots</li>
                      </ul>
                      
                      <p style="text-align: center;">
                        <a href="https://thejerktracker0.vercel.app/customer" class="button">Go to Dashboard</a>
                      </p>
                      
                      <p>If you have any questions or need assistance, feel free to reach out to us at <a href="mailto:support@jerktrackerx.com">support@jerktrackerx.com</a></p>
                      
                      <p>Enjoy tracking your jerk!</p>
                      <p><strong>The JERK Tracker Team</strong></p>
                    </div>
                    <div class="footer">
                      <p>© 2025 The JERK Tracker. All rights reserved.</p>
                    </div>
                  </div>
                </body>
                </html>
              `
            },
            Text: {
              Data: `Welcome to The JERK Tracker!\n\nHi ${name}!\n\nThank you for joining The JERK Tracker community! We're excited to have you on board.\n\nYour account has been successfully created and you're ready to start tracking your delicious jerk orders.\n\nWhat's next?\n- Access your dashboard on web or mobile\n- Start placing and tracking orders\n- Monitor your order history\n- Rate your favorite jerk spots\n\nGo to Dashboard: https://thejerktracker0.vercel.app/customer\n\nIf you have any questions, contact us at support@jerktrackerx.com\n\nEnjoy tracking your jerk!\nThe JERK Tracker Team`
            }
          }
        }
      };

      await sesClient.send(new SendEmailCommand(emailParams));
      console.log('Welcome email sent to:', email);
    } catch (emailError) {
      // Don't fail signup if email fails, just log it
      console.error('Failed to send welcome email:', emailError);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        user: userWithoutPassword,
        message: 'Account created successfully'
      })
    };

  } catch (error) {
    console.error('Signup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to create account' 
      })
    };
  }
};
