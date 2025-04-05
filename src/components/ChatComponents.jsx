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

