import React from 'react';
import { PageHeader } from '../components/UI';
import { PricingGrid } from '../components/Pricing';
import { useApp } from '../context/AppContext';
import { Zap } from 'lucide-react';

const PricingPage = () => {
  const { selectModel } = useApp();

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center bg-yellow-400 text-gray-800 px-4 py-2 rounded-lg shadow-md">
          <Zap className="w-6 h-6 mr-2" />
          <span className="text-lg font-bold tracking-tight">Lightning Model</span>
        </div>
        <PageHeader />
      </div>
      
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-yellow-600 bg-clip-text text-transparent">
          Choose Your Payment Model
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Select the pricing structure that best fits your usage pattern
        </p>
      </div>
      
      <PricingGrid onModelSelect={selectModel} />
    </>
  );
};

export default PricingPage;