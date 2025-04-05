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