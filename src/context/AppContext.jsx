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

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const AppProvider = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCalls, setTotalCalls] = useState(0);
  const [planType, setPlanType] = useState(null);

  const selectModel = (modelName) => {
    setSelectedModel(modelName);
  };

  const resetChat = () => {
    setSelectedModel(null);
    setMessages([]);
    setTotalCalls(0);
    setPlanType(null);
  };

  const clearError = () => {
    setError(null);
  };

  const sendMessage = async (content) => {
    if (!content.trim()) return;

    try {
      const userMessage = { role: 'user', content };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setIsLoading(true);
      setError(null);

      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await geminiService.sendMessage(content, messageHistory);

      const assistantMessage = { 
        role: 'assistant', 
        content: response.content
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      setTotalCalls(prev => prev + 1);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get response from Gemini. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    selectedModel,
    selectModel,
    messages,
    sendMessage,
    isLoading,
    resetChat,
    error,
    clearError,
    totalCalls,
    planType,
    setPlanType,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

export default AppContext;