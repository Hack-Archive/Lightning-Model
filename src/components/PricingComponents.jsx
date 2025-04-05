import React from 'react';
import { Check } from 'lucide-react';
import { llmModels, pricingPlans } from '../common.js';

export const ModelSelector = ({ onSelect }) => {
  const model = llmModels[0];
  
  const handleSelect = () => {
    onSelect(model.name);
  };

  return (
    <button
      onClick={handleSelect}
      className="w-full px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between border border-white/10"
    >
      <div className="flex flex-col items-start">
        <span className="font-medium">{model.name}</span>
        <span className="text-sm text-gray-400">{model.description}</span>
      </div>
    </button>
  );
};

export const PricingGrid = ({ onModelSelect, onPlanSelect }) => {
    return (
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        {pricingPlans.map((plan) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            onModelSelect={onModelSelect}
            onPlanSelect={onPlanSelect}
          />
        ))}
      </div>
    );
  };

  export const PlanCard = ({ plan, onModelSelect, onPlanSelect }) => {
    const { name, price, unit, features, icon: Icon, type } = plan;
    const getPlanFeatures = () => {
      if (name === 'Pay Per Token') {
        return [
          'Pay only for what you use',
          'No monthly commitments',
          'Token Usage tracking',
          'Volume discounts available'
        ];
      } else if (name === 'Pay Per Request') {
        return [
          'Simple pricing model',
          'Unlimited tokens per request',
          'API Calls tracking',
          'Bulk pricing available'
        ];
      }
      return features;
    };
    
    const handleGetStarted = () => {
      const defaultModel = llmModels[0].name;
      onModelSelect(defaultModel);
      onPlanSelect(type);
    };  