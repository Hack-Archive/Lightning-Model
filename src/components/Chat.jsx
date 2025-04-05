import React, { useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ChatMarkdown from './ChatMarkdown.jsx';

/**
 * @param {Object} props
 * @param {(message: string) => void} props.onSendMessage
 * @param {boolean} [props.isDisabled]
 */
const ChatInput = ({ onSendMessage, isDisabled = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim() || isDisabled) return;
    
    onSendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        disabled={isDisabled}
        className={`w-full px-4 py-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors border border-gray-300 text-gray-800 shadow-sm ${
          isDisabled ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      />
      
      <button
        onClick={handleSubmit}
        disabled={isDisabled || !input.trim()}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 transition-colors rounded-full ${
          isDisabled || !input.trim()
            ? 'bg-gray-300 cursor-not-allowed'
            : 'hover:bg-yellow-500 bg-yellow-400'
        }`}
      >
        <Send className="w-4 h-4 text-gray-800" />
      </button>
    </div>
  );
};

/**
 * @param {Object} props
 * @param {Object} props.message
 * @param {string} props.message.role
 * @param {string} props.message.content
 */
const ChatMessage = ({ message }) => {
  const { role, content } = message;

  return (
    <div
      className={`flex items-start space-x-2 ${
        role === 'user' ? 'justify-end' : ''
      }`}
    >
      {role === 'assistant' && (
        <Bot className="w-6 h-6 p-1 flex-shrink-0 text-gray-700 bg-yellow-100 rounded-full border border-yellow-300" />
      )}
      
      <div
        className={`flex flex-col max-w-[70%] ${
          role === 'user' ? 'items-end' : ''
        }`}
      >
        <div
          className={`rounded-lg py-2 px-3 border ${
            role === 'user'
              ? 'bg-yellow-400 text-gray-800 border-yellow-500'
              : 'bg-white border-gray-200 text-gray-800'
          }`}
        >
          {role === 'assistant' ? (
            <ChatMarkdown content={content} />
          ) : (
            content
          )}
        </div>
      </div>
      
      {role === 'user' && (
        <User className="w-6 h-6 p-1 flex-shrink-0 text-gray-700 bg-yellow-400 rounded-full border border-yellow-500" />
      )}
    </div>
  );
};

const LoadingIndicator = () => (
  <div className="flex items-start space-x-2 animate-pulse">
    <Bot className="w-6 h-6 p-1 flex-shrink-0 text-gray-700 bg-yellow-100 rounded-full border border-yellow-300" />
    
    <div className="flex flex-col max-w-[70%]">
      <div className="rounded-lg py-2 px-3 border bg-gray-100 border-gray-200">
        <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
      </div>
    </div>
  </div>
);

/**
 * @param {Object} props
 * @param {string} props.message
 * @param {() => void} props.onRetry
 */
const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex items-start space-x-2">
    <Bot className="w-6 h-6 p-1 flex-shrink-0 text-red-700 bg-red-100 rounded-full border border-red-300" />
    
    <div className="flex flex-col max-w-[70%]">
      <div className="rounded-lg py-2 px-3 border bg-red-50 border-red-200 text-red-700">
        <p>{message}</p>
        <button 
          onClick={onRetry}
          className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-2 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
);

export { ChatInput, ChatMessage, ChatWindow };