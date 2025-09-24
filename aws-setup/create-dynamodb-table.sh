# DynamoDB Table Creation Script
# Run this AWS CLI command to create the DynamoDB table

aws dynamodb create-table \
    --table-name jerktracker-orders \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=createdAt,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        IndexName=CreatedAtIndex,KeySchema=[{AttributeName=createdAt,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region us-east-1

# Alternative PowerShell command for Windows:
# aws dynamodb create-table --table-name jerktracker-orders --attribute-definitions AttributeName=id,AttributeType=S AttributeName=createdAt,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --global-secondary-indexes IndexName=CreatedAtIndex,KeySchema=[{AttributeName=createdAt,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-1

# Table Schema:
# - Primary Key: id (String) - Unique order identifier
# - Sort Key: None (single item per order)
# - GSI: CreatedAtIndex - For querying orders by creation date
# 
# Attributes stored:
# - id: string
# - orderNumber: string
# - customerName: string  
# - customerEmail: string
# - orderDetails: string
# - status: string ('pending' | 'picked_up')
# - createdAt: string (ISO datetime)
# - pickedUpAt?: string (ISO datetime)
# - driverName?: string
# - driverCompany?: string