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