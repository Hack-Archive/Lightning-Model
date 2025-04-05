import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext({
  selectedModel: null,
  selectModel: () => {},
  messages: [],
  sendMessage: () => {},
  totalTokens: 0,
  resetChat: () => {},
});

export const AppProvider = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);

  const selectModel = (modelName) => {
    setSelectedModel(modelName);
  };

  const resetChat = () => {
    setSelectedModel(null);
    setMessages([]);
    setTotalTokens(0);
  };