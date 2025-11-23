/**
 * Duplication Detection Management Interface
 * 
 * Admin component for managing page duplication detection settings,
 * viewing reports, and configuring rules.
 */

'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button, Card, Heading, Text, Flex, Grid } from '@/styles/components';
import { DuplicationConfig, DuplicationRule, DuplicationDetectionConfig } from '@/lib/duplication-config';
import { PageRegistry } from '@/lib/page-registry';

const ManagementContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const StatsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)<{ $theme?: string }>`
  padding: 1.5rem;
  text-align: center;
  border-left: 4px solid;
  border-left-color: ${({ $theme }) => $theme || '#ed7734'};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #1c1917;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #78716c;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TabContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: ${({ $active }) => $active ? '#ed7734' : '#6b7280'};
  border-bottom: 2px solid ${({ $active }) => $active ? '#ed7734' : 'transparent'};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ed7734;
  }
`;

const ConfigSection = styled(Card)`
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ConfigGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const ConfigItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const Toggle = styled.button<{ $enabled: boolean }>`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  background: ${({ $enabled }) => $enabled ? '#10b981' : '#d1d5db'};
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $enabled }) => $enabled ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s ease;
  }
`;

const RulesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RuleCard = styled(Card)<{ $priority?: number }>`
  padding: 1.5rem;
  border-left: 4px solid;
  border-left-color: ${({ $priority }) => {
    if (!$priority) return '#ed7734';
    if ($priority >= 8) return '#ef4444'; // High priority - red
    if ($priority >= 5) return '#f59e0b'; // Medium priority - yellow  
    return '#10b981'; // Low priority - green
  }};
`;

const RuleHeader = styled(Flex)`
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const RuleActions = styled(Flex)`
  gap: 0.5rem;
`;

interface DuplicationManagementProps {
  className?: string;
}

export function DuplicationManagement({ className }: DuplicationManagementProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'rules' | 'reports'>('overview');
  const [config, setConfig] = useState<DuplicationDetectionConfig | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [rules, setRules] = useState<DuplicationRule[]>([]);
  const [showDisabledRules, setShowDisabledRules] = useState(false);

  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const loadConfig = () => {
    const currentConfig = DuplicationConfig.getConfig();
    setConfig(currentConfig);
    setRules(currentConfig.customRules);
  };

  const loadStats = () => {
    const report = DuplicationConfig.generateReport();
    const pageStats = PageRegistry.generateUsageReport();
    
    setStats({
      systemEnabled: report.enabled,
      activeRules: report.rulesCount,
      cacheSize: report.cacheSize,
      totalPages: pageStats.totalPages,
      publicPages: pageStats.publicPages,
      protectedPages: pageStats.protectedPages,
      dynamicPages: pageStats.dynamicPages
    });
  };

  const toggleSystem = () => {
    if (config) {
      const newConfig = { ...config, enabled: !config.enabled };
      DuplicationConfig.updateConfig({ enabled: !config.enabled });
      setConfig(newConfig);
      loadStats();
    }
  };

  const toggleStrictMode = () => {
    if (config) {
      const newConfig = { ...config, strict: !config.strict };
      DuplicationConfig.updateConfig({ strict: !config.strict });
      setConfig(newConfig);
    }
  };

  const toggleRule = (ruleId: string) => {
    const updatedRules = rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    );
    setRules(updatedRules);
    DuplicationConfig.updateConfig({ customRules: updatedRules });
    loadStats();
  };

  const deleteRule = (ruleId: string) => {
    DuplicationConfig.removeCustomRule(ruleId);
    loadConfig();
    loadStats();
  };

  const exportConfig = () => {
    const configJson = DuplicationConfig.exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'duplication-detection-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetConfig = () => {
    if (confirm('Are you sure you want to reset to default configuration? This cannot be undone.')) {
      DuplicationConfig.resetToDefault();
      loadConfig();
      loadStats();
    }
  };

  const filteredRules = showDisabledRules ? rules : rules.filter(rule => rule.enabled);

  if (!config || !stats) {
    return (
      <ManagementContainer>
        <Flex $justify="center" $align="center" style={{ minHeight: '200px' }}>
          <RefreshCw className="animate-spin" size={32} />
        </Flex>
      </ManagementContainer>
    );
  }

  return (
    <ManagementContainer className={className}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading as="h1" $size="3xl" $weight="bold" $mb="2rem" $color="#1c1917">
          <Shield size={32} style={{ marginRight: '12px', verticalAlign: 'text-top' }} />
          Page Duplication Detection Management
        </Heading>

        {/* Stats Overview */}
        <StatsGrid>
          <StatCard $theme={stats.systemEnabled ? '#10b981' : '#ef4444'}>
            <StatValue>{stats.systemEnabled ? 'Active' : 'Inactive'}</StatValue>
            <StatLabel>System Status</StatLabel>
          </StatCard>
          
          <StatCard $theme="#3b82f6">
            <StatValue>{stats.totalPages}</StatValue>
            <StatLabel>Total Pages</StatLabel>
          </StatCard>
          
          <StatCard $theme="#f59e0b">
            <StatValue>{stats.activeRules}</StatValue>
            <StatLabel>Active Rules</StatLabel>
          </StatCard>
          
          <StatCard $theme="#8b5cf6">
            <StatValue>{stats.cacheSize}</StatValue>
            <StatLabel>Cache Entries</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Tab Navigation */}
        <TabContainer>
          <TabButtons>
            <TabButton 
              $active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 size={16} style={{ marginRight: '8px' }} />
              Overview
            </TabButton>
            <TabButton 
              $active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} style={{ marginRight: '8px' }} />
              Settings
            </TabButton>
            <TabButton 
              $active={activeTab === 'rules'} 
              onClick={() => setActiveTab('rules')}
            >
              <Shield size={16} style={{ marginRight: '8px' }} />
              Rules
            </TabButton>
            <TabButton 
              $active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')}
            >
              <BarChart3 size={16} style={{ marginRight: '8px' }} />
              Reports
            </TabButton>
          </TabButtons>
        </TabContainer>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <ConfigSection>
            <Heading as="h2" $size="xl" $weight="semibold" $mb="1.5rem">
              System Overview
            </Heading>
            
            <ConfigGrid>
              <div>
                <Heading as="h3" $size="lg" $mb="1rem">Quick Actions</Heading>
                <Flex $direction="column" $gap="1rem">
                  <ConfigItem>
                    <Text>Enable/Disable System</Text>
                    <Toggle $enabled={config.enabled} onClick={toggleSystem} />
                  </ConfigItem>
                  
                  <ConfigItem>
                    <Text>Strict Mode</Text>
                    <Toggle $enabled={config.strict} onClick={toggleStrictMode} />
                  </ConfigItem>
                  
                  <Button $variant="outline" onClick={() => DuplicationConfig.clearCache()}>
                    <RefreshCw size={16} style={{ marginRight: '8px' }} />
                    Clear Cache
                  </Button>
                </Flex>
              </div>
              
              <div>
                <Heading as="h3" $size="lg" $mb="1rem">Page Statistics</Heading>
                <div>
                  <Text $mb="0.5rem">Public Pages: {stats.publicPages}</Text>
                  <Text $mb="0.5rem">Protected Pages: {stats.protectedPages}</Text>
                  <Text $mb="0.5rem">Dynamic Pages: {stats.dynamicPages}</Text>
                </div>
              </div>
            </ConfigGrid>
          </ConfigSection>
        )}

        {activeTab === 'settings' && (
          <ConfigSection>
            <Flex $justify="space-between" $align="center" style={{ marginBottom: '1.5rem' }}>
              <Heading as="h2" $size="xl" $weight="semibold">
                Configuration Settings
              </Heading>
              <Flex $gap="1rem">
                <Button $variant="outline" onClick={exportConfig}>
                  <Download size={16} style={{ marginRight: '8px' }} />
                  Export Config
                </Button>
                <Button $variant="ghost" onClick={resetConfig}>
                  <RefreshCw size={16} style={{ marginRight: '8px' }} />
                  Reset to Default
                </Button>
              </Flex>
            </Flex>

            <ConfigGrid>
              <div>
                <Heading as="h3" $size="lg" $mb="1rem">Detection Thresholds</Heading>
                <Text $size="sm" $color="#78716c" $mb="1rem">
                  Confidence levels for duplication detection
                </Text>
                <div>
                  <Text $mb="0.5rem">High: {(config.preventionThreshold.high * 100).toFixed(0)}%</Text>
                  <Text $mb="0.5rem">Medium: {(config.preventionThreshold.medium * 100).toFixed(0)}%</Text>
                  <Text $mb="0.5rem">Low: {(config.preventionThreshold.low * 100).toFixed(0)}%</Text>
                </div>
              </div>
              
              <div>
                <Heading as="h3" $size="lg" $mb="1rem">Performance Settings</Heading>
                <div>
                  <Text $mb="0.5rem">Cache Results: {config.performance.cacheResults ? 'Yes' : 'No'}</Text>
                  <Text $mb="0.5rem">Cache TTL: {config.performance.cacheTtl} minutes</Text>
                  <Text $mb="0.5rem">Max Alternatives: {config.performance.maxAlternatives}</Text>
                </div>
              </div>
            </ConfigGrid>
          </ConfigSection>
        )}

        {activeTab === 'rules' && (
          <ConfigSection>
            <Flex $justify="space-between" $align="center" style={{ marginBottom: '1.5rem' }}>
              <Heading as="h2" $size="xl" $weight="semibold">
                Detection Rules ({filteredRules.length})
              </Heading>
              <Flex $gap="1rem">
                <Button
                  $variant="ghost"
                  onClick={() => setShowDisabledRules(!showDisabledRules)}
                >
                  {showDisabledRules ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span style={{ marginLeft: '8px' }}>
                    {showDisabledRules ? 'Hide Disabled' : 'Show All'}
                  </span>
                </Button>
                <Button $variant="primary">
                  <Plus size={16} style={{ marginRight: '8px' }} />
                  Add Rule
                </Button>
              </Flex>
            </Flex>

            <RulesList>
              {filteredRules.map((rule, index) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RuleCard $priority={rule.priority}>
                    <RuleHeader>
                      <div>
                        <Flex $align="center" style={{ marginBottom: '0.5rem' }}>
                          <Heading as="h3" $size="lg" $weight="semibold" $color="#1c1917">
                            {rule.name}
                          </Heading>
                          {rule.enabled ? (
                            <CheckCircle size={16} color="#10b981" style={{ marginLeft: '8px' }} />
                          ) : (
                            <AlertTriangle size={16} color="#f59e0b" style={{ marginLeft: '8px' }} />
                          )}
                        </Flex>
                        <Text $size="sm" $color="#78716c" $mb="0.5rem">
                          {rule.description}
                        </Text>
                        <Text $size="xs" $color="#9ca3af">
                          Priority: {rule.priority} | Action: {rule.action}
                          {rule.redirectTo && ` | Redirect: ${rule.redirectTo}`}
                        </Text>
                      </div>
                      
                      <RuleActions>
                        <Button
                          $variant="ghost"
                          $size="sm"
                          onClick={() => toggleRule(rule.id)}
                        >
                          {rule.enabled ? 'Disable' : 'Enable'}
                        </Button>
                        <Button $variant="ghost" $size="sm">
                          <Edit size={14} />
                        </Button>
                        <Button 
                          $variant="ghost" 
                          $size="sm"
                          onClick={() => deleteRule(rule.id)}
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </RuleActions>
                    </RuleHeader>
                    
                    {rule.message && (
                      <Text $size="sm" $color="#57534e" style={{ 
                        fontStyle: 'italic',
                        padding: '0.75rem',
                        background: '#fafaf9',
                        borderRadius: '0.5rem',
                        border: '1px solid #e7e5e4'
                      }}>
                        &quot;{rule.message}&quot;
                      </Text>
                    )}
                  </RuleCard>
                </motion.div>
              ))}
              
              {filteredRules.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                  <Shield size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <Text>No rules configured yet</Text>
                </div>
              )}
            </RulesList>
          </ConfigSection>
        )}

        {activeTab === 'reports' && (
          <ConfigSection>
            <Heading as="h2" $size="xl" $weight="semibold" $mb="1.5rem">
              System Reports
            </Heading>
            
            <Text $color="#78716c">
              Detailed analytics and reporting features will be available in the next update.
            </Text>
          </ConfigSection>
        )}
      </motion.div>
    </ManagementContainer>
  );
}

export default DuplicationManagement;