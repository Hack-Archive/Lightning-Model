import React from 'react';
import { PageHeader, ProgressBar } from '../components/UI.jsx';
import { ChatWindow } from '../components/Chat.jsx';
import { useApp } from '../context/AppContext.jsx';

const ChatPage = () => {
  const { 
    selectedModel, 
    messages, 
    sendMessage, 
    resetChat, 
    isLoading,
    error,
    totalCalls,
    planType
  } = useApp();

  const tokenLimit = 100000;
  const apiCallLimit = 1000;

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