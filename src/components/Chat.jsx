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

const ChatMessage = ({ message }) => {
  const { role, content, tokens } = message;

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
          {content}
        </div>
        
        {tokens && (
          <div className="text-xs text-gray-600 mt-0.5">
            {tokens} tokens
          </div>
        )}
      </div>
      
      {role === 'user' && (
        <User className="w-6 h-6 p-1 flex-shrink-0 text-gray-700 bg-yellow-400 rounded-full border border-yellow-500" />
      )}
    </div>
  );
};

const ChatWindow = ({ messages, onSendMessage }) => {
  return (
    <div className="flex flex-col h-full rounded-lg border border-gray-300 bg-white/80 p-4 shadow-lg">
      <div className="flex-1 overflow-auto space-y-3 mb-3 pr-2 custom-scrollbar">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Send a message to start the conversation
          </div>
        )}
      </div>
      
      <div className="flex-none">
        <ChatInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};

export { ChatInput, ChatMessage, ChatWindow };