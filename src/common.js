import { Coins, Zap } from 'lucide-react';
export const llmModels = [
  { name: 'Gemini 1.5 Flash', description: 'Google\'s most capable model' },
];

export const pricingPlans = [
  {
    name: 'Pay Per Token',
    price: '0.0000001',
    unit: 'per token',
    features: [
      'Pay only for what you use',
      'No monthly commitments',
      'Token Usage tracking',
      'Volume discounts available'
    ],
    icon: Coins,
    type: 'token',
  },
  {
    name: 'Pay Per Request',
    price: '0.000005',
    unit: 'per request',
    features: [
      'Simple pricing model',
      'Unlimited tokens per request',
      'API Calls tracking',
      'Bulk pricing available'
    ],
    icon: Zap,
    type: 'request',
  },
];

export const formatBtc = (btc, decimals = 8) => {
  return `₿${btc.toFixed(decimals)}`;
};

export const formatSats = (sats) => {
  return `${sats.toLocaleString()} sats`;
};

export const tokensToBtc = (tokens, ratePerToken = 0.0000001) => {
  return tokens * ratePerToken;
};