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
  
  const displayFeatures = getPlanFeatures();

  return (
    <div
      className="relative rounded-2xl p-8 transition-all duration-300 hover:transform hover:-translate-y-2 border border-yellow-300 shadow-lg h-full"
      style={{
        background: 'white',
        minHeight: '480px',
      }}
    >
      <div className="absolute -top-3 -right-3">
        <div className="bg-yellow-400 text-gray-800 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
          <Icon className="w-6 h-6 text-gray-800" />
        </div>
      </div>

      <div className="mb-6 pt-4">
        <h3 className="text-2xl font-bold text-gray-800">{name}</h3>
        <div className="mt-2">
          <span className="text-4xl font-bold text-gray-900">₿{price}</span>
          <span className="text-gray-600 ml-2">{unit}</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {displayFeatures.map((feature) => (
          <div key={feature} className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-1 mr-3">
              <Check className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 left-8 right-8">
        <div className="w-full px-4 py-3 rounded-lg bg-gray-100 mb-4 flex items-center justify-between border border-gray-200">
          <div className="flex flex-col items-start">
            <span className="font-medium text-gray-800">Gemini 1.5 Flash</span>
            <span className="text-sm text-gray-600">Most capable model</span>
          </div>
        </div>
        
        <button 
          onClick={handleGetStarted}
          className="w-full px-6 py-3 rounded-lg bg-yellow-400 text-gray-800 hover:bg-yellow-500 transition-colors font-medium"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};