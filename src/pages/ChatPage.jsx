import React from 'react';
import { PageHeader } from '../components/UI';
import { useApp } from '../context/AppContext';

const ChatPage = () => {
  const { selectedModel, resetChat } = useApp();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-none flex items-center justify-between mb-4">
        <PageHeader 
          showBackButton={true}
          onBack={resetChat}
          modelName={selectedModel}
        />
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
      </div>
    </div>
  );
};

export default ChatPage;