import React from 'react';
import { Background } from './components/UI';
import { PricingPage, ChatPage } from './pages';
import { AppProvider, useApp } from './context/AppContext';

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