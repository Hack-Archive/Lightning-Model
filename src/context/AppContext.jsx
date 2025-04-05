import React, { createContext, useState, useContext } from 'react';
import geminiService from '../services/geminiService.js';

const AppContext = createContext({
  selectedModel: null,
  selectModel: () => {},
  messages: [],
  sendMessage: () => {},
  isLoading: false,
  resetChat: () => {},
  error: null,
  clearError: () => {},
  totalCalls: 0,
  planType: null,
  setPlanType: () => {},
});

export const AppProvider = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);

  const selectModel = (modelName) => {
    setSelectedModel(modelName);
  };

  const resetChat = () => {
    setSelectedModel(null);
    setMessages([]);
    setTotalTokens(0);
  };

  const sendMessage = (content) => {
    if (!content.trim()) return;

    const userTokens = Math.floor(content.length * 1.3);
    const assistantTokens = Math.floor(userTokens * 1.5);

    const newMessages = [
      ...messages,
      { role: 'user', content, tokens: userTokens },
      { 
        role: 'assistant', 
        content: `This is a simulated response from ${selectedModel}. In a real implementation, this would be the actual response from the API.`,
        tokens: assistantTokens
      }
    ];

    setMessages(newMessages);
    setTotalTokens(prev => prev + userTokens + assistantTokens);
  };

  const value = {
    selectedModel,
    selectModel,
    messages,
    sendMessage,
    totalTokens,
    resetChat,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using app context
export const useApp = () => useContext(AppContext);

export default AppContext;  