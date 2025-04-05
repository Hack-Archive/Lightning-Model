import React from 'react';
import { Background } from './components/UI.jsx';
import { PricingPage, ChatPage } from './pages/index.js';
import { AppProvider, useApp } from './context/AppContext.jsx';

const AppContent = () => {
  const { selectedModel } = useApp();

  return (
    <Background>
      {selectedModel ? <ChatPage /> : <PricingPage />}
    </Background>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;