/**
 * Intelligent Prompt Handler
 * 
 * This component provides a smart interface for handling difficult prompts
 * and preventing unnecessary page creation by offering intelligent alternatives.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  Lightbulb,
  CheckCircle,
  X,
  Home,
  Settings,
  Users,
  Package
} from 'lucide-react';
import { PageCreationPrevention } from '@/lib/page-creation-prevention';
import { PageRegistry, PageDefinition } from '@/lib/page-registry';
import { Button, Card, Heading, Text, Flex } from '@/styles/components';

const OverlayWrapper = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const PromptHandlerCard = styled(Card)`
  max-width: 600px;
  width: 100%;
  padding: 2.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const IconWrapper = styled.div<{ $variant: 'warning' | 'success' | 'info' }>`
  width: 64px;
  height: 64px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'warning': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'success': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'info': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }};
  color: white;
`;

const AlternativesList = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AlternativeItem = styled(motion.div)`
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
  
  &:hover {
    border-color: #ed7734;
    background: #fef7ee;
    transform: translateY(-2px);
  }
`;

const AlternativeHeader = styled(Flex)`
  align-items: center;
  margin-bottom: 0.5rem;
`;

const AlternativeIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #ed7734, #de5d20);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

interface PromptHandlerProps {
  isVisible: boolean;
  requestedPath: string;
  userPrompt?: string;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onForceCreate?: () => void;
}

export function IntelligentPromptHandler({
  isVisible,
  requestedPath,
  userPrompt = '',
  onClose,
  onNavigate,
  onForceCreate
}: PromptHandlerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [alternatives, setAlternatives] = useState<PageDefinition[]>([]);
  const [prevention, setPrevention] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (isVisible && requestedPath) {
      const report = PageCreationPrevention.generatePreventionReport(requestedPath, userPrompt);
      setPrevention(report.prevention);
      
      // Get alternatives based on intent
      const allPages = PageRegistry.getAllPages();
      const filteredAlternatives = allPages.filter(page => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            page.name.toLowerCase().includes(query) ||
            page.description.toLowerCase().includes(query) ||
            page.keywords.some(k => k.toLowerCase().includes(query))
          );
        }
        
        // Default alternatives based on keywords
        if (report.analysis.keywords.length > 0) {
          return page.keywords.some(pk => 
            report.analysis.keywords.some(k => 
              pk.toLowerCase().includes(k) || k.includes(pk.toLowerCase())
            )
          );
        }
        
        return false;
      }).slice(0, 4);
      
      setAlternatives(filteredAlternatives);
    }
  }, [isVisible, requestedPath, userPrompt, searchQuery]);

  const handleAlternativeClick = (page: PageDefinition) => {
    onNavigate(page.path);
    onClose();
  };

  const handleDirectNavigation = () => {
    if (prevention?.redirectUrl) {
      onNavigate(prevention.redirectUrl);
    }
    onClose();
  };

  const getIconForPage = (page: PageDefinition) => {
    switch (page.category) {
      case 'admin': return Settings;
      case 'auth': return Users;
      case 'order': return Package;
      case 'public': return Home;
      default: return Search;
    }
  };

  if (!isVisible) return null;

  return (
    <OverlayWrapper
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <PromptHandlerCard
        as={motion.div}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>
        
        <div style={{ textAlign: 'center' }}>
          <IconWrapper $variant={prevention?.confidence === 'high' ? 'warning' : 'info'}>
            {prevention?.shouldPrevent ? <AlertTriangle size={28} /> : <Lightbulb size={28} />}
          </IconWrapper>
          
          <Heading as="h2" $size="2xl" $weight="bold" $mb="1rem" $color="#1c1917">
            {prevention?.shouldPrevent ? 'Page Already Exists!' : 'Smart Navigation'}
          </Heading>
          
          <Text $size="lg" $color="#57534e" $mb="1.5rem">
            {prevention?.reason || 'We found some great alternatives for what you\'re looking for.'}
          </Text>
          
          {prevention?.shouldPrevent && prevention.redirectUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <Button
                $variant="primary" 
                $size="lg"
                onClick={handleDirectNavigation}
                style={{ marginRight: '1rem' }}
              >
                Go to {prevention.suggestedAlternative || 'Existing Page'}
                <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </Button>
            </motion.div>
          )}
        </div>

        <SearchInput
          type="text"
          placeholder="Search for specific functionality..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <AlternativesList>
          <AnimatePresence>
            {alternatives.map((page, index) => {
              const IconComponent = getIconForPage(page);
              return (
                <AlternativeItem
                  key={page.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAlternativeClick(page)}
                >
                  <AlternativeHeader>
                    <AlternativeIcon>
                      <IconComponent size={20} />
                    </AlternativeIcon>
                    <div>
                      <Heading as="h3" $size="lg" $weight="semibold" $mb="0" $color="#1c1917">
                        {page.name}
                      </Heading>
                      <Text $size="sm" $color="#78716c">
                        {page.path}
                      </Text>
                    </div>
                  </AlternativeHeader>
                  <Text $size="base" $color="#57534e">
                    {page.description}
                  </Text>
                </AlternativeItem>
              );
            })}
          </AnimatePresence>
          
          {alternatives.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}
            >
              <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <Text $size="base" $color="#9ca3af">
                {searchQuery ? 'No matching pages found. Try a different search term.' : 'No suggested alternatives available.'}
              </Text>
            </motion.div>
          )}
        </AlternativesList>

        {onForceCreate && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Text $size="sm" $color="#9ca3af" $mb="1rem">
              Still need to create a new page?
            </Text>
            <Button
              $variant="ghost"
              $size="sm"
              onClick={() => {
                onForceCreate();
                onClose();
              }}
            >
              Force Create New Page
            </Button>
          </div>
        )}
      </PromptHandlerCard>
    </OverlayWrapper>
  );
}

/**
 * Hook for using the intelligent prompt handler
 */
export function usePromptHandler() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<{
    path: string;
    prompt?: string;
  } | null>(null);
  const router = useRouter();

  const showHandler = (requestedPath: string, userPrompt?: string) => {
    const report = PageCreationPrevention.generatePreventionReport(requestedPath, userPrompt);
    
    // Only show if prevention is recommended
    if (report.prevention.shouldPrevent) {
      setCurrentRequest({ path: requestedPath, prompt: userPrompt });
      setIsVisible(true);
      return true;
    }
    
    return false;
  };

  const hideHandler = () => {
    setIsVisible(false);
    setCurrentRequest(null);
  };

  const navigateToPath = (path: string) => {
    router.push(path);
  };

  return {
    isVisible,
    currentRequest,
    showHandler,
    hideHandler,
    navigateToPath,
    PromptHandler: (props: Omit<PromptHandlerProps, 'isVisible' | 'onClose' | 'onNavigate'>) => (
      <IntelligentPromptHandler
        {...props}
        isVisible={isVisible}
        onClose={hideHandler}
        onNavigate={navigateToPath}
      />
    )
  };
}

export default IntelligentPromptHandler;