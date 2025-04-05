import React, { createContext, useState, useContext, useEffect } from 'react';
import { Background } from './components/UIComponents.jsx';
import { ChatPage, PricingPage, RequestLimitPage, TokenLimitPage } from './pages/Pages.jsx';
import { apiService, RateLimitError } from './services.js';
import { PaymentProvider } from './context/PaymentContext';

const AppContext = createContext({
  selectedModel: null,
  selectModel: () => {},
  messages: [],
  sendMessage: () => Promise.resolve(),
  isLoading: false,
  resetChat: () => Promise.resolve(),
  error: null,
  clearError: () => {},
  totalCalls: 0,
  planType: null,
  setPlanType: () => {},
  sessionStatus: null,
  requestsRemaining: null,
  configureRequestLimit: async () => {},
  configureTokenLimit: async () => {},
  limitConfigured: false,
  setLimitConfigured: () => {},
  rateLimitInfo: null,
  tokensRemaining: null,
  tokenUsage: null,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);

const AppProvider = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCalls, setTotalCalls] = useState(0);
  const [planType, setPlanType] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [requestsRemaining, setRequestsRemaining] = useState(null);
  const [tokensRemaining, setTokensRemaining] = useState(null);
  const [tokenUsage, setTokenUsage] = useState(null);
  const [limitConfigured, setLimitConfigured] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState(null);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        if (apiService.isSessionActive()) {
          console.log("Found existing session, restoring state...");

          const status = await apiService.getSessionStatus();
          console.log("Session status:", status);

          setSessionStatus(status);
          setPlanType(status.plan_type);
          setLimitConfigured(true);

          if (status.plan_type === 'request' && status.total_requests_limit) {
            setRequestsRemaining(status.total_requests_limit - status.request_count);
          } else if (status.plan_type === 'token' && status.total_token_limit) {
            setTokensRemaining(status.total_token_limit - status.token_count);
          }

          try {
            const history = await apiService.getChatHistory();
            if (history && history.length > 0) {
              setMessages(history.map(msg => ({
                role: msg.role,
                content: msg.content
              })));
            }
          } catch (historyErr) {
            console.warn("Could not fetch message history:", historyErr);
          }
        }
      } catch (err) {
        console.warn("Failed to restore session:", err);
      }
    };
    
    checkExistingSession();

    return () => {
    };
  }, []);

  const selectModel = (modelName) => {
    setSelectedModel(modelName);
  };

  const resetChat = async () => {
    if (sessionStatus && sessionStatus.is_active) {
      try {
        await apiService.terminateSession();
      } catch (err) {
        console.error('Error terminating session:', err);
      }
    }

    setSelectedModel(null);
    setMessages([]);
    setTotalCalls(0);
    setPlanType(null);
    setSessionStatus(null);
    setRequestsRemaining(null);
    setLimitConfigured(false);
    setRateLimitInfo(null);
    setTokensRemaining(null);
    setTokenUsage(null);
  };

  const clearError = () => {
    setError(null);
  };

  const configureRequestLimit = async (limit) => {
    if (!planType) {
      throw new Error('Plan type not selected');
    }

    try {
      await apiService.createSession(planType, limit);
      const status = await apiService.getSessionStatus();
      setSessionStatus(status);

      if (status.total_requests_limit) {
        setRequestsRemaining(status.total_requests_limit);
      }

      setLimitConfigured(true);
    } catch (err) {
      console.error('Error configuring request limit:', err);
      throw err;
    }
  };

  const configureTokenLimit = async (limit) => {
    if (!planType) {
      throw new Error('Plan type not selected');
    }
  
    try {
      console.log(`Configuring token limit: ${limit} for plan type: ${planType}`);

      const sessionToken = await apiService.createSession(planType);
      console.log(`Session created successfully with token: ${sessionToken}`);

      await apiService.updateTokenConfig(limit);
      console.log(`Token limit updated successfully: ${limit}`);

      const status = await apiService.getSessionStatus();
      console.log(`Retrieved session status:`, status);
      setSessionStatus(status);

      if (status.total_token_limit) {
        setTokensRemaining(status.total_token_limit - status.token_count);
      }

      setLimitConfigured(true);
      
      console.log(`Token limit configuration complete: ${limit}`);
    } catch (err) {
      console.error('Error configuring token limit:', err);
      throw err;
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim()) return;

    try {
      if (!sessionStatus || !sessionStatus.is_active) {
        setError("No active session. Please select a plan and configure limits first.");
        return;
      }

      const userMessage = { role: 'user', content };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setIsLoading(true);
      setError(null);
      setRateLimitInfo(null);

      const response = await apiService.sendMessage(content);

      const assistantMessage = { 
        role: 'assistant', 
        content: response.content
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      setTotalCalls(prev => prev + 1);

      if (response.requestsRemaining !== undefined) {
        setRequestsRemaining(response.requestsRemaining);
      }

      if (response.tokensRemaining !== undefined) {
        setTokensRemaining(response.tokensRemaining);
      }
      
      if (response.tokenUsage) {
        setTokenUsage(prev => (prev || 0) + response.tokenUsage);
      }

      if (response.sessionActive === false) {
        const status = await apiService.getSessionStatus();
        setSessionStatus(status);
      }
      
    } catch (err) {
      console.error('Error sending message:', err);
      
      if (err.message === 'No active session' || err.message === 'Session expired or invalid') {
        setError('Your session has expired or is not active. Please restart the conversation.');
        resetChat();
      } else if (err instanceof RateLimitError) {
        setError(`Rate limit exceeded: ${err.message}`);

        setRateLimitInfo({
          isLimited: true,
          message: err.message,
          retryAfter: 60 
        });

        try {
          const status = await apiService.getSessionStatus();
          setSessionStatus(status);
        } catch (statusErr) {
          console.error('Error fetching session status:', statusErr);
        }
      } else {
        setError('Failed to get response. Please try again.');
      }
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
    sessionStatus,
    requestsRemaining,
    configureRequestLimit,
    configureTokenLimit,
    limitConfigured,
    setLimitConfigured,
    rateLimitInfo,
    tokensRemaining,
    tokenUsage,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

const AppContent = () => {
  const { selectedModel, planType, limitConfigured } = useApp();

  const renderPage = () => {
    if (!selectedModel) {
      return <PricingPage />;
    }

    if (planType === 'token' && !limitConfigured) {
      return <TokenLimitPage />;
    }

    if (planType === 'request' && !limitConfigured) {
      return <RequestLimitPage />;
    }

    return <ChatPage />;
  };

  return (
    <Background>
      {renderPage()}
    </Background>
  );
};

const App = () => {
  return (
    <PaymentProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </PaymentProvider>
  );
};

export default App;