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
  const locationId = event.pathParameters?.id;

  try {
    // GET /locations - List all locations
    if (method === 'GET' && !locationId) {
      const result = await docClient.send(new ScanCommand({
        TableName: 'Locations'
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          locations: result.Items || []
        })
      };
    }

    // GET /locations/{id} - Get single location
    if (method === 'GET' && locationId) {
      const result = await docClient.send(new GetCommand({
        TableName: 'Locations',
        Key: { id: locationId }
      }));

      if (!result.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: 'Location not found' 
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          location: result.Item
        })
      };
    }

    // POST /locations - Create new location
    if (method === 'POST') {
      const body = JSON.parse(event.body);
      
      const newLocation = {
        id: `location-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        ...body,
        createdAt: new Date().toISOString()
      };

      await docClient.send(new PutCommand({
        TableName: 'Locations',
        Item: newLocation
      }));

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          location: newLocation
        })
      };
    }

    // PUT /locations/{id} - Update location
    if (method === 'PUT' && locationId) {
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
        TableName: 'Locations',
        Key: { id: locationId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Location updated successfully'
        })
      };
    }

    // DELETE /locations/{id} - Delete location
    if (method === 'DELETE' && locationId) {
      await docClient.send(new DeleteCommand({
        TableName: 'Locations',
        Key: { id: locationId }
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Location deleted successfully'
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
    console.error('Locations handler error:', error);
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
