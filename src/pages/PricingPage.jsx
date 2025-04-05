import React from 'react';
import { PageHeader } from '../components/UI';

const PricingPage = () => {
  return (
    <>
      <PageHeader title="Pricing" />
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
      </div>
    </>
  );
};

export default PricingPage;