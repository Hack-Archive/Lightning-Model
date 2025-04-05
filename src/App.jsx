import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let sessionToken = localStorage.getItem('sessionToken') || null;

if (sessionToken) {
  api.defaults.headers.common['X-Session-Token'] = sessionToken;
}

export class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export const apiService = {
  isSessionActive() {
    return !!sessionToken;
  },

  async createSession(planType, totalRequestsLimit, totalTokenLimit) {
    try {
      console.log(`Creating session with planType: ${planType}, requestLimit: ${totalRequestsLimit}, tokenLimit: ${totalTokenLimit}`);
      const response = await api.post('/sessions/create', {
        plan_type: planType,
        total_requests_limit: totalRequestsLimit || null,
        total_token_limit: totalTokenLimit || null,
      });

      sessionToken = response.data.session_token;
      console.log(`Session created with token: ${sessionToken}`);

      if (sessionToken) {
        api.defaults.headers.common['X-Session-Token'] = sessionToken;

        localStorage.setItem('sessionToken', sessionToken);
      }

      return sessionToken || '';
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  async updateSessionConfig(config) {
    if (!sessionToken) {
      throw new Error('No active session');
    }
    
    try {
      await api.put('/sessions/config', config);
    } catch (error) {
      console.error('Error updating session config:', error);
      throw error;
    }
  },

  async updateTokenConfig(totalTokenLimit) {
    if (!sessionToken) {
      throw new Error('No active session');
    }
    
    try {
      console.log(`Updating token config with limit: ${totalTokenLimit}`);
      const response = await api.put('/sessions/token-config', {
        total_token_limit: totalTokenLimit
      });
      console.log('Token config update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating token config:', error);

      if (axios.isAxiosError(error)) {
        const axiosError = error;
        const message = axiosError.response?.data?.detail || 'Unknown error occurred';
        throw new Error(`Failed to update token config: ${message}`);
      } else {
        throw new Error(`Failed to update token config: ${error.message || 'Unknown error'}`);
      }
    }
  },

  async getSessionStatus() {
    if (!sessionToken) {
      throw new Error('No active session');
    }
    
    try {
      const response = await api.get('/sessions/status');
      return response.data;
    } catch (error) {
      console.error('Error getting session status:', error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        sessionToken = null;
        localStorage.removeItem('sessionToken');
        delete api.defaults.headers.common['X-Session-Token'];
      }
      
      throw error;
    }
  },

  async terminateSession() {
    if (!sessionToken) {
      return;
    }
    
    try {
      await api.post('/sessions/terminate');
      sessionToken = null;
      localStorage.removeItem('sessionToken');
      
      if ('X-Session-Token' in api.defaults.headers.common) {
        delete api.defaults.headers.common['X-Session-Token'];
      }
    } catch (error) {
      console.error('Error terminating session:', error);
      throw error;
    }
  },

  async sendMessage(message, chatHistory = []) {
    if (!sessionToken) {
      throw new Error('No active session');
    }
    
    try {
      const response = await api.post('/chat/message', {
        message,
        history: chatHistory,
      });
      
      return {
        content: response.data.content,
        latencyMs: response.data.latency_ms,
        requestsRemaining: response.data.requests_remaining,
        tokensRemaining: response.data.tokens_remaining,
        tokenUsage: response.data.token_usage,
        sessionActive: response.data.session_active,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error;

        if (axiosError.response?.status === 401) {
          sessionToken = null;
          localStorage.removeItem('sessionToken');
          delete api.defaults.headers.common['X-Session-Token'];
          throw new Error('Session expired or invalid');
        }

        if (axiosError.response?.status === 429) {
          const errorMessage = axiosError.response.data?.detail || 'Rate limit exceeded';
          throw new RateLimitError(errorMessage);
        }
      }
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getChatHistory() {
    if (!sessionToken) {
      throw new Error('No active session');
    }
    
    try {
      const response = await api.get('/chat/history');
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }
};

export default apiService;