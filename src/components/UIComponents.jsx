import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bot, Clock, AlertCircle, Database, Zap } from 'lucide-react';

export const Background = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] text-gray-800 relative overflow-hidden">
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

export const PageHeader = ({ 
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

  const ProgressBar = ({ label, current, max, unit }) => (
    <div className="mb-2 p-2 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <span className="text-xs font-medium text-gray-600">
          {current.toLocaleString()} / {max.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(current / max) * 100}%` }}
        />
      </div>
    </div>
  );
 
  export const RateLimitAlert = ({ rateLimitInfo }) => {
    const [timeRemaining, setTimeRemaining] = useState(rateLimitInfo.retryAfter);
    
    useEffect(() => {
      let timer;
      
      if (timeRemaining > 0) {
        timer = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      
      return () => {
        if (timer) clearInterval(timer);
      };
    }, [rateLimitInfo, timeRemaining]);
  
    const formatTime = (seconds) => {
      if (seconds <= 0) return 'Try again now';
      
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      
      if (mins > 0) {
        return `${mins}m ${secs}s remaining`;
      }
      return `${secs}s remaining`;
    };
    
    return (
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center text-yellow-800">
        <AlertCircle className="w-5 h-5 mr-2 text-yellow-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{rateLimitInfo.message}</p>
          {timeRemaining > 0 && (
            <div className="flex items-center mt-1 text-sm">
              <Clock className="w-4 h-4 mr-1 text-yellow-600" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export const RequestLimitConfig = ({ onSubmit, onBack }) => {
    const [requestLimit, setRequestLimit] = useState(100);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
  
    const presetLimits = [50, 100, 500, 1000];
  
    const handleSubmit = async () => {
      if (requestLimit <= 0) {
        setError('Request limit must be greater than 0');
        return;
      }
  
      setIsSubmitting(true);
      setError(null);
  
      try {
        await onSubmit(requestLimit);
      } catch (err) {
        setError('Failed to set request limit. Please try again.');
        console.error('Error setting request limit:', err);
      } finally {
        setIsSubmitting(false);
      }
    };  