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