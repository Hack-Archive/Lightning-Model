import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSendMessage }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className="w-full px-4 py-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-gray-300 text-gray-800 shadow-sm"
      />
      <button
        onClick={handleSubmit}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-yellow-500 bg-yellow-400 rounded-full transition-colors"
      >
        <Send className="w-4 h-4 text-gray-800" />
      </button>
    </div>
  );
};

export { ChatInput };