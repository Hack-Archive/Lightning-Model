import React from 'react';
import { PageHeader, ProgressBar } from '../components/UI';
import { ChatWindow } from '../components/Chat';
import { useApp } from '../context/AppContext';

const ChatPage = () => {
  const { selectedModel, messages, sendMessage, totalTokens, resetChat } = useApp();

  const tokenLimit = 100000;
  const apiCallLimit = 1000;
  const currentApiCalls = 47;

  const isPayPerToken = selectedModel === 'Gemini 1.5 Flash';

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
        {isPayPerToken ? (
          <div className="mb-4">
            <ProgressBar
              label="Token Usage"
              current={totalTokens}
              max={tokenLimit}
              unit="tokens"
            />
          </div>
        ) : (
          <div className="mb-4">
            <ProgressBar
              label="API Calls"
              current={currentApiCalls}
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
        />
      </div>
    </div>
  );
};

export default ChatPage;