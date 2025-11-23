require('dotenv').config({ path: '.env.local' });
const { DynamoDBClient, ListTablesCommand, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function createUsersTable() {
  try {
    // First list existing tables
    console.log('📋 Checking existing tables...\n');
    const listResult = await client.send(new ListTablesCommand({}));
    console.log('Existing tables:', listResult.TableNames);
    
    if (listResult.TableNames.includes('jerktracker-users')) {
      console.log('\n✅ Users table already exists!');
      return;
    }

    console.log('\n🔧 Creating jerktracker-users table...\n');

    const params = {
      TableName: 'jerktracker-users',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }  // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EmailIndex',
          KeySchema: [
            { AttributeName: 'email', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    const result = await client.send(new CreateTableCommand(params));
    console.log('✅ Users table created successfully!');
    console.log('Table status:', result.TableDescription.TableStatus);
    console.log('\n⏳ Table is being created. Wait 30-60 seconds before using it.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

createUsersTable();
