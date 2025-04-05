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
          modelName={selectedModel || undefined}
        />
      </div>

      {/* Show terminated session warning if applicable */}
      {isSessionTerminated && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg flex items-center text-red-800">
          <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
          <span>Session terminated: You've reached your {planType === 'token' ? 'token' : 'request'} limit.</span>
        </div>
      )}

      {/* Show rate limit alert if applicable */}
      {rateLimitInfo && rateLimitInfo.isLimited && !isSessionTerminated && (
        <RateLimitAlert rateLimitInfo={rateLimitInfo} />
      )}

      {/* Conditionally show the appropriate progress bar based on plan type */}
      <div className="flex-none">
        {planType === 'token' && sessionStatus?.total_token_limit && (
          <div className="mb-4">
            <ProgressBar
              label="Tokens Remaining"
              current={tokensRemaining !== null ? tokensRemaining : (sessionStatus.total_token_limit - sessionStatus.token_count)}
              max={sessionStatus.total_token_limit}
              unit="tokens"
            />
          </div>
        )}
        
        {planType === 'request' && requestsRemaining !== null && sessionStatus?.total_requests_limit && (
          <div className="mb-4">
            <ProgressBar
              label="API Requests Remaining"
              current={requestsRemaining}
              max={sessionStatus.total_requests_limit}
              unit="requests"
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

export const PricingPage = () => {
  const { selectModel, setPlanType } = useApp();

  const handleModelSelect = (modelName) => {
    selectModel(modelName);
  };

  const handlePlanSelect = (planType) => {
    setPlanType(planType);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center bg-yellow-400 text-gray-800 px-4 py-2 rounded-lg shadow-md">
          <Zap className="w-6 h-6 mr-2" />
          <span className="text-lg font-bold tracking-tight">Lightning Model</span>
        </div>
        <PageHeader />
      </div>
      
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-yellow-600 bg-clip-text text-transparent">
          Choose Your Payment Model
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Select the pricing structure that best fits your usage pattern
        </p>
      </div>
      
      <PricingGrid 
        onModelSelect={handleModelSelect} 
        onPlanSelect={handlePlanSelect}
      />
    </>
  );
};

export const RequestLimitPage = () => {
  const { configureRequestLimit, resetChat } = useApp();

  const handleSubmit = async (limit) => {
    await configureRequestLimit(limit);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <PageHeader title="Configure Request Limit" />
      </div>
      
      <div className="flex-1 flex justify-center">
        <RequestLimitConfig 
          onSubmit={handleSubmit}
          onBack={resetChat}
        />
      </div>
    </>
  );
};

export const TokenLimitPage = () => {
  const { configureTokenLimit, resetChat } = useApp();

  const handleSubmit = async (limit) => {
    await configureTokenLimit(limit);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center bg-yellow-400 text-gray-800 px-4 py-2 rounded-lg shadow-md">
          <Coins className="w-6 h-6 mr-2" />
          <span className="text-lg font-bold tracking-tight">Token Configuration</span>
        </div>
        <PageHeader title="Configure Token Limit" />
      </div>
      
      <div className="flex-1 flex justify-center">
        <TokenLimitConfig 
          onSubmit={handleSubmit}
          onBack={resetChat}
        />
      </div>
    </>
  );
};