import React from 'react';
import { ArrowLeft, Bot } from 'lucide-react';

const Background = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-gray-800 relative overflow-hidden">
      {/* Light background with subtle yellow accents */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-yellow-300/20 blur-3xl"></div>
        <div className="absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-yellow-400/20 blur-3xl"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-4 h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
};

const PageHeader = ({ 
    title, 
    showBackButton = false, 
    onBack, 
    modelName 
  }) => {
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {showBackButton && onBack && (
            <button 
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-sm">Back</span>
            </button>
          )}
          
          {modelName ? (
            <div className="flex items-center space-x-2 py-1">
              <Bot className="w-5 h-5 text-yellow-600" />
              <span className="text-base font-medium text-gray-800">{modelName}</span>
            </div>
          ) : (
            <div className="flex items-center">
              {title && (
                <span className="text-xl font-medium text-gray-800">{title}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };