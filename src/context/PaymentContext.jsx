import React, { createContext, useState, useContext } from 'react';
import { createInvoice, calculatePaymentAmount } from '../services/lndService';

const PaymentContext = createContext({
  invoice: null,
  isLoading: false,
  error: null,
  createPaymentInvoice: async () => {},
  resetPayment: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider = ({ children }) => {
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPaymentInvoice = async (planType, limit) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Creating invoice for ${planType} plan with limit ${limit}`);

      const amountSats = calculatePaymentAmount(planType, limit);
      console.log(`Calculated payment amount: ${amountSats} sats`);

      const memo = `Lightning Model API - ${planType === 'token' ? 'Token' : 'Request'} Plan (${limit} ${planType === 'token' ? 'tokens' : 'requests'})`;

      const invoiceData = await createInvoice(amountSats, memo);
      console.log('Invoice created successfully:', invoiceData);
      
      setInvoice(invoiceData);
      return invoiceData;
    } catch (err) {
      console.error('Error details:', err);

      let errorMessage = 'Failed to create invoice';
      
      if (err.response) {
        console.error('Response error data:', err.response.data);
        console.error('Response error status:', err.response.status);
        
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || err.message || 'Unknown error'}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } 
      
      setError(errorMessage);
      console.error('Payment error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPayment = () => {
    setInvoice(null);
    setError(null);
  };

  const value = {
    invoice,
    isLoading,
    error,
    createPaymentInvoice,
    resetPayment,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export default PaymentProvider;