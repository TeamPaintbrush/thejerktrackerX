'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { QRCodeCanvas } from 'qrcode.react';
import { DynamoDBService, Order } from '../../lib/dynamodb';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Smartphone, 
  QrCode,
  Database,
  Globe,
  ArrowLeft
} from 'lucide-react';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 1rem;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 2rem;
`;

const TestGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const TestCard = styled.div<{ $status: 'success' | 'warning' | 'error' | 'info' }>`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => {
    switch (props.$status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  }};
`;

const TestTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
`;

const TestResult = styled.div<{ $status: 'success' | 'warning' | 'error' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
  
  ${props => {
    switch (props.$status) {
      case 'success':
        return `background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;`;
      case 'warning':
        return `background: #fef3c7; color: #92400e; border: 1px solid #fde68a;`;
      case 'error':
        return `background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5;`;
      default:
        return `background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd;`;
    }
  }}
`;

const TestDetails = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
`;

const QRSection = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 3rem;
`;

const QRGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const QRCard = styled.div`
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
`;

const QRTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
`;

const QRWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`;

const QRUrl = styled.a`
  color: #3b82f6;
  font-size: 0.75rem;
  text-decoration: none;
  word-break: break-all;
  margin-bottom: 1rem;
  display: block;
  
  &:hover {
    text-decoration: underline;
  }
`;

const InstructionsSection = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
`;

const StepList = styled.ol`
  list-style: none;
  counter-reset: step-counter;
  padding: 0;
`;

const StepItem = styled.li`
  counter-increment: step-counter;
  margin-bottom: 1.5rem;
  padding-left: 3rem;
  position: relative;
  
  &::before {
    content: counter(step-counter);
    position: absolute;
    left: 0;
    top: 0;
    background: #ed7734;
    color: white;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.875rem;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #ed7734;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: #de5d20;
    transform: translateY(-1px);
  }
`;

interface TestResults {
  environment: 'success' | 'error';
  localStorage: 'success' | 'error';
  orderCreation: 'success' | 'error';
  qrGeneration: 'success' | 'error';
  urlStructure: 'success' | 'error';
}

export default function QRTestPage() {
  const [isClient, setIsClient] = useState(false);
  const [testResults, setTestResults] = useState<TestResults>({
    environment: 'error',
    localStorage: 'error',
    orderCreation: 'error',
    qrGeneration: 'error',
    urlStructure: 'error'
  });
  const [testOrder, setTestOrder] = useState<Order | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [serviceStatus, setServiceStatus] = useState<{
    dynamoDBAvailable: boolean;
    fallbackMode: boolean;
    storageType: string;
    region?: string;
    tableName?: string;
  } | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    runTests();
    loadServiceStatus();
  }, [isClient]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadServiceStatus = async () => {
    try {
      const status = await DynamoDBService.getServiceStatus();
      setServiceStatus(status);
      console.log('Service status:', status);
    } catch (error) {
      console.error('Failed to load service status:', error);
    }
  };

  const runTests = async () => {
    const results: TestResults = {
      environment: 'error',
      localStorage: 'error',
      orderCreation: 'error',
      qrGeneration: 'error',
      urlStructure: 'error'
    };

    // Test 1: Environment Detection
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const hasWindow = typeof window !== 'undefined';
      const hasLocalStorage = typeof localStorage !== 'undefined';
      
      if (hasWindow && hasLocalStorage) {
        results.environment = 'success';
      }
    } catch (e) {
      console.error('Environment test failed:', e);
    }

    // Test 2: localStorage Test
    try {
      const testKey = 'jerktracker_test_' + Date.now();
      const testValue = 'test_data';
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        results.localStorage = 'success';
      }
    } catch (e) {
      console.error('localStorage test failed:', e);
    }

    // Test 3: Order Creation
    let createdOrder: Order | null = null;
    try {
      const newOrder: Omit<Order, 'id' | 'createdAt'> = {
        orderNumber: 'TEST' + Date.now(),
        customerName: 'QR Test Customer',
        customerEmail: 'test@qrtest.com',
        orderDetails: 'Test QR Code Order - 1x Jerk Chicken Combo',
        status: 'pending'
      };

      createdOrder = await DynamoDBService.createOrder(newOrder);
      setTestOrder(createdOrder);
      results.orderCreation = 'success';
    } catch (e) {
      console.error('Order creation test failed:', e);
    }

    // Test 4: QR Generation
    try {
      if (createdOrder) {
        // Detect production by checking hostname
        const isProduction = window.location.hostname.includes('github.io');
        const basePath = isProduction ? '/thejerktrackerX' : '';
        const orderUrl = `${window.location.origin}${basePath}/order?id=${createdOrder.id}`;
        
        console.log('QR Generation test - URL:', orderUrl, 'Production:', isProduction);
        
        if (orderUrl.includes('/order?id=') && createdOrder.id) {
          results.qrGeneration = 'success';
        }
      } else {
        console.warn('QR generation test skipped - no test order created');
      }
    } catch (e) {
      console.error('QR generation test failed:', e);
    }

    // Test 5: URL Structure
    try {
      if (createdOrder) {
        // Detect production by checking hostname
        const isProduction = window.location.hostname.includes('github.io');
        const basePath = isProduction ? '/thejerktrackerX' : '';
        const expectedPattern = isProduction 
          ? /https:\/\/.*\.github\.io\/thejerktrackerX\/order\?id=.+/
          : /http:\/\/localhost:3000\/order\?id=.+/;
        
        const orderUrl = `${window.location.origin}${basePath}/order?id=${createdOrder.id}`;
        console.log('URL Structure test - URL:', orderUrl, 'Pattern:', expectedPattern.toString(), 'Production:', isProduction);
        
        if (expectedPattern.test(orderUrl)) {
          results.urlStructure = 'success';
        } else {
          console.warn('URL structure test failed:', orderUrl, 'does not match', expectedPattern.toString());
        }
      } else {
        console.warn('URL structure test skipped - no test order created');
      }
    } catch (e) {
      console.error('URL structure test failed:', e);
    }

    setTestResults(results);
  };

  const getStatusIcon = (status: 'success' | 'warning' | 'error' | 'info') => {
    switch (status) {
      case 'success': return <CheckCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'error': return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  if (!isClient) {
    return (
      <PageContainer>
        <ContentWrapper>
          <Header>
            <Title>Loading QR Code Tests...</Title>
          </Header>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>🧪 QR Code System Test - GitHub Pages</Title>
          <Subtitle>
            Comprehensive testing of the QR Code workflow on GitHub Pages deployment
          </Subtitle>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            <strong>Environment:</strong> {process.env.NODE_ENV === 'production' ? 'Production (GitHub Pages)' : 'Development'}
            <br />
            <strong>Current URL:</strong> {currentUrl}
            <br />
            <strong>Storage Type:</strong> {serviceStatus?.storageType || 'Loading...'}
            {serviceStatus?.dynamoDBAvailable && (
              <>
                <br />
                <strong>DynamoDB:</strong> ✅ Connected ({serviceStatus.region})
                <br />
                <strong>Table:</strong> {serviceStatus.tableName}
              </>
            )}
            {serviceStatus?.fallbackMode && (
              <>
                <br />
                <strong>Mode:</strong> ⚠️ Fallback (localStorage)
              </>
            )}
          </div>
        </Header>

        {/* Test Results */}
        <TestGrid>
          <TestCard $status={testResults.environment}>
            <TestTitle>
              <Globe size={24} />
              Environment Check
            </TestTitle>
            <TestResult $status={testResults.environment}>
              {getStatusIcon(testResults.environment)}
              {testResults.environment === 'success' ? 'Environment Ready' : 'Environment Issues'}
            </TestResult>
            <TestDetails>
              Verifying browser environment, window object, and basic functionality.
              {testResults.environment === 'success' 
                ? ' ✅ All browser APIs available.'
                : ' ❌ Browser environment not fully ready.'}
            </TestDetails>
          </TestCard>

          <TestCard $status={testResults.localStorage}>
            <TestTitle>
              <Database size={24} />
              Data Persistence
            </TestTitle>
            <TestResult $status={testResults.localStorage}>
              {getStatusIcon(testResults.localStorage)}
              {testResults.localStorage === 'success' ? 'localStorage Working' : 'localStorage Failed'}
            </TestResult>
            <TestDetails>
              Testing localStorage read/write capabilities for order data persistence.
              {testResults.localStorage === 'success' 
                ? ' ✅ Data can be saved and retrieved.'
                : ' ❌ Cannot save data to localStorage.'}
            </TestDetails>
          </TestCard>

          <TestCard $status={testResults.orderCreation}>
            <TestTitle>
              <CheckCircle size={24} />
              Order Creation
            </TestTitle>
            <TestResult $status={testResults.orderCreation}>
              {getStatusIcon(testResults.orderCreation)}
              {testResults.orderCreation === 'success' ? 'Orders Created Successfully' : 'Order Creation Failed'}
            </TestResult>
            <TestDetails>
              Testing DynamoDBService order creation and ID generation.
              {testResults.orderCreation === 'success' 
                ? ` ✅ Test order created with ID: ${testOrder?.id}`
                : ' ❌ Failed to create test order.'}
            </TestDetails>
          </TestCard>

          <TestCard $status={testResults.qrGeneration}>
            <TestTitle>
              <QrCode size={24} />
              QR Code Generation
            </TestTitle>
            <TestResult $status={testResults.qrGeneration}>
              {getStatusIcon(testResults.qrGeneration)}
              {testResults.qrGeneration === 'success' ? 'QR Codes Generated' : 'QR Generation Failed'}
            </TestResult>
            <TestDetails>
              Testing QR code generation with proper URLs and order linking.
              {testResults.qrGeneration === 'success' 
                ? ' ✅ QR codes link correctly to order pages.'
                : ' ❌ QR code generation has issues.'}
            </TestDetails>
          </TestCard>

          <TestCard $status={testResults.urlStructure}>
            <TestTitle>
              <Smartphone size={24} />
              URL Structure
            </TestTitle>
            <TestResult $status={testResults.urlStructure}>
              {getStatusIcon(testResults.urlStructure)}
              {testResults.urlStructure === 'success' ? 'URLs Structured Correctly' : 'URL Issues Detected'}
            </TestResult>
            <TestDetails>
              Verifying URL patterns match expected GitHub Pages or localhost structure.
              {testResults.urlStructure === 'success' 
                ? ' ✅ URLs follow correct pattern for current environment.'
                : ' ❌ URL structure may cause scanning issues.'}
            </TestDetails>
          </TestCard>
        </TestGrid>

        {/* Live QR Code Test */}
        {testOrder && (
          <QRSection>
            <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>📱 Live QR Code Test</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Scan these QR codes with your phone to test the complete workflow:
            </p>
            
            <QRGrid>
              <QRCard>
                <QRTitle>Test Order QR Code</QRTitle>
                <QRWrapper>
                  <QRCodeCanvas 
                    value={(() => {
                      const isProduction = currentUrl.includes('github.io');
                      const basePath = isProduction ? '/thejerktrackerX' : '';
                      return `${currentUrl}${basePath}/order?id=${testOrder.id}`;
                    })()}
                    size={150}
                  />
                </QRWrapper>
                <QRUrl 
                  href={(() => {
                    const isProduction = currentUrl.includes('github.io');
                    const basePath = isProduction ? '/thejerktrackerX' : '';
                    return `${currentUrl}${basePath}/order?id=${testOrder.id}`;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {(() => {
                    const isProduction = currentUrl.includes('github.io');
                    const basePath = isProduction ? '/thejerktrackerX' : '';
                    return `${currentUrl}${basePath}/order?id=${testOrder.id}`;
                  })()}
                </QRUrl>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Order #{testOrder.orderNumber}
                </div>
              </QRCard>
            </QRGrid>
          </QRSection>
        )}

        {/* Testing Instructions */}
        <InstructionsSection>
          <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>📋 Manual Testing Steps</h2>
          <StepList>
            <StepItem>
              <strong>Scan QR Code:</strong> Use your phone camera or QR scanner app to scan the test QR code above.
            </StepItem>
            <StepItem>
              <strong>Verify Page Load:</strong> Confirm the order page loads correctly showing order details and customer information.
            </StepItem>
            <StepItem>
              <strong>Fill Driver Form:</strong> Enter driver name and select delivery company from dropdown.
            </StepItem>
            <StepItem>
              <strong>Submit Pickup:</strong> Click &quot;Confirm Pickup&quot; and verify success message appears.
            </StepItem>
            <StepItem>
              <strong>Check Admin:</strong> Return to admin dashboard and verify order status changed to &quot;Picked Up&quot;.
            </StepItem>
          </StepList>
          
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: '#fef3c7', 
            borderRadius: '0.5rem',
            border: '1px solid #fde68a'
          }}>
            <strong style={{ color: '#92400e' }}>⚠️ Important:</strong>
            <p style={{ margin: '0.5rem 0 0', color: '#92400e', fontSize: '0.875rem' }}>
              If the QR code scan works but data isn&apos;t persisting, the issue is likely with localStorage 
              domain restrictions on GitHub Pages. The tests above will help identify the exact issue.
            </p>
          </div>
        </InstructionsSection>

        <div style={{ textAlign: 'center' }}>
          <BackButton href="/admin">
            <ArrowLeft size={20} />
            Back to Admin Dashboard
          </BackButton>
        </div>
      </ContentWrapper>
    </PageContainer>
  );
}