import React, { useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', html);

const ChatMarkdown = ({ content }) => {
  const components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const lang = match ? match[1] : '';
      const codeContent = String(children).replace(/\n$/, '');
      const isInline = !className || !match;
      
      if (isInline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      
      return (
        <div className="rounded-md overflow-hidden my-2">
          <SyntaxHighlighter
            language={lang}
            style={oneDark}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0.375rem',
            }}
          >
            {codeContent}
          </SyntaxHighlighter>
        </div>
      );
    }
  };

  return (
    <ReactMarkdown components={components}>
      {content}
    </ReactMarkdown>
  );
};

export const ChatInput = ({ onSendMessage, isDisabled = false }) => {
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

export const ChatMessage = ({ message }) => {
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

export const ChatWindow = ({ 
  messages, 
  onSendMessage, 
  isLoading = false,
  error = null 
}) => {
  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        onSendMessage(lastUserMessage.content);
      }
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border border-gray-300 bg-white/80 p-4 shadow-lg">
      <div className="flex-1 overflow-auto space-y-3 mb-3 pr-2 custom-scrollbar">
        {messages.length > 0 ? (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && <LoadingIndicator />}
            {error && <ErrorMessage message={error} onRetry={handleRetry} />}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Send a message to start the conversation
          </div>
        )}
      </div>
      
      <div className="flex-none">
        <ChatInput onSendMessage={onSendMessage} isDisabled={isLoading} />
      </div>
    </div>
  );
};