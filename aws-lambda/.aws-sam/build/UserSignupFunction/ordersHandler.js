const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const method = event.httpMethod;
  const orderId = event.pathParameters?.id;

  try {
    // GET /orders - List all orders
    if (method === 'GET' && !orderId) {
      const result = await docClient.send(new ScanCommand({
        TableName: 'jerktracker-orders'
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          orders: result.Items || []
        })
      };
    }

    // GET /orders/{id} - Get single order
    if (method === 'GET' && orderId) {
      const result = await docClient.send(new GetCommand({
        TableName: 'jerktracker-orders',
        Key: { id: orderId }
      }));

      if (!result.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Order not found' 
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          order: result.Item
        })
      };
    }

    // POST /orders - Create new order
    if (method === 'POST') {
      const body = JSON.parse(event.body);
      
      const newOrder = {
        id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        ...body,
        status: body.status || 'pending',
        createdAt: new Date().toISOString(),
        qrCode: `${process.env.NEXT_PUBLIC_QR_TRACKING_BASE_URL || 'https://thejerktracker0.vercel.app'}/qr-tracking/${body.id || `order-${Date.now()}`}`
      };

      await docClient.send(new PutCommand({
        TableName: 'jerktracker-orders',
        Item: newOrder
      }));

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          order: newOrder
        })
      };
    }

    // PUT /orders/{id} - Update order
    if (method === 'PUT' && orderId) {
      const body = JSON.parse(event.body);
      
      // Build update expression dynamically
      const updateExpressions = [];
      const expressionAttributeValues = {};
      const expressionAttributeNames = {};
      
      Object.keys(body).forEach((key, index) => {
        if (key !== 'id') {
          updateExpressions.push(`#attr${index} = :val${index}`);
          expressionAttributeNames[`#attr${index}`] = key;
          expressionAttributeValues[`:val${index}`] = body[key];
        }
      });

      if (updateExpressions.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'No fields to update' 
          })
        };
      }

      await docClient.send(new UpdateCommand({
        TableName: 'jerktracker-orders',
        Key: { id: orderId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Order updated successfully'
        })
      };
    }

    // DELETE /orders/{id} - Delete order
    if (method === 'DELETE' && orderId) {
      await docClient.send(new DeleteCommand({
        TableName: 'jerktracker-orders',
        Key: { id: orderId }
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Order deleted successfully'
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed' 
      })
    };

  } catch (error) {
    console.error('Orders handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      })
    };
  }
};
