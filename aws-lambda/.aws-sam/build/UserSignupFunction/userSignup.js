const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

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

    // Check if user exists
    const existingUser = await docClient.send(new GetCommand({
      TableName: 'jerktracker-users',
      Key: { email }
    }));

    if (existingUser.Item) {
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

    // Generate business ID
    const businessId = `BUS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create user
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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
      TableName: 'jerktracker-users',
      Item: newUser
    }));

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
