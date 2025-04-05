import React from 'react';
import { llmModels } from '../data';

const ModelSelector = ({ onSelect }) => {
  const model = llmModels[0]; 

  return (
    <button
      onClick={() => onSelect(model.name)}
      className="w-full px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between border border-white/10"
    >
      <div className="flex flex-col items-start">
        <span className="font-medium">{model.name}</span>
        <span className="text-sm text-gray-400">{model.description}</span>
      </div>
    </button>
  );
};

export { ModelSelector }