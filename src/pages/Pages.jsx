import React from 'react';
import { PageHeader, ProgressBar, RateLimitAlert } from '../components/UIComponents.jsx';
import { ChatWindow } from '../components/ChatComponents.jsx';
import { PricingGrid } from '../components/PricingComponents.jsx';
import { TokenLimitConfig } from '../components/TokenLimitConfig.jsx';
import { RequestLimitConfig } from '../components/RequestLimitConfig.jsx';
import { useApp } from '../App.jsx';
import { AlertCircle, Zap, Coins } from 'lucide-react';

export const ChatPage = () => {
  const { 
    selectedModel, 
    messages, 
    sendMessage, 
    resetChat, 
    isLoading,
    error,
    planType,
    requestsRemaining,
    tokensRemaining,
    sessionStatus,
    rateLimitInfo
  } = useApp();

  const isSessionTerminated = sessionStatus && !sessionStatus.is_active;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none flex items-center justify-between mb-4">
        <PageHeader 
          showBackButton={true}
          onBack={resetChat}
          modelName={selectedModel}
        />
      </div>

      <div className="flex-none">
        {planType === 'token' && (
          <div className="mb-4">
            <ProgressBar
              label="Token Usage"
              current={estimateTokenUsage()}
              max={tokenLimit}
              unit="tokens"
            />
          </div>
        )}
        
        {planType === 'request' && (
          <div className="mb-4">
            <ProgressBar
              label="API Calls"
              current={totalCalls}
              max={apiCallLimit}
              unit="calls"
            />
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatWindow 
          messages={messages} 
          onSendMessage={sendMessage}
          isLoading={isLoading}
          error={error} 
        />
      </div>
    </div>
  );
};

export default ChatPage;