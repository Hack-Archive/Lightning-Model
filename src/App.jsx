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