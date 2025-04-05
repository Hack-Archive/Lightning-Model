import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bot, Clock, AlertCircle, Database, Zap } from 'lucide-react';

export const Background = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-yellow-300/20 blur-3xl"></div>
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-yellow-400/20 blur-3xl"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-4 h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
};

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