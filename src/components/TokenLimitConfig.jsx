import React, { useState } from 'react';
import { ArrowLeft, Coins, Database } from 'lucide-react';
import { usePayment } from '../context/PaymentContext';
import LightningPaymentModal from './LightningPayment';
import { calculatePaymentAmount } from '../services/lndService';

export const TokenLimitConfig = ({ onSubmit, onBack }) => {
  const [tokenLimit, setTokenLimit] = useState(100000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const { invoice, createPaymentInvoice, resetPayment } = usePayment();

  const presetLimits = [10000, 50000, 100000, 500000];

  const paymentAmount = calculatePaymentAmount('token', tokenLimit);

  const handleSubmit = async () => {
    if (tokenLimit <= 0) {
      setError('Token limit must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log("Creating Lightning invoice for", tokenLimit, "tokens");

      const invoiceResult = await createPaymentInvoice('token', tokenLimit);
      
      if (!invoiceResult) {
        throw new Error("Failed to create invoice");
      }
      
      console.log("Invoice created successfully:", invoiceResult);
      setDebugInfo("Invoice created: " + JSON.stringify(invoiceResult).substring(0, 100) + "...");

      setShowPaymentModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set token limit. Please try again.';
      setError(errorMessage);
      setDebugInfo("Error: " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
      console.error('Error setting token limit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePaymentSuccess = async () => {
    try {
      console.log("Payment received, configuring session with limit:", tokenLimit);
      setDebugInfo("Payment successful, configuring session...");

      await onSubmit(tokenLimit);
      
      setDebugInfo("Session configured successfully");

      setTimeout(() => {
        setShowPaymentModal(false);
        resetPayment();
      }, 2000);
    } catch (err) {
      setError('Payment was received but failed to create session. Please contact support.');
      setDebugInfo("Session config error: " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
      console.error('Error after payment:', err);
    }
  };
  
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    resetPayment();
  };

  return (
    <>
      <div className="flex flex-col h-full max-w-xl mx-auto bg-white/90 rounded-xl border border-gray-300 shadow-lg p-6 overflow-auto">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Configure Token Usage Limit</h2>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-lg shadow-md flex items-center">
            <Coins className="w-5 h-5 mr-2" />
            <span className="text-base font-bold tracking-tight">Pay Per Token</span>
          </div>
        </div>

        <div className="mb-6 overflow-y-auto">
          <p className="text-gray-700 mb-4 text-sm">
            Set the total number of tokens you want to use for this session. 
            When this limit is reached, your session will automatically terminate.
          </p>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2 text-sm">Total Token Limit</label>
            <div className="flex">
              <div className="relative flex-1">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="number"
                  min="1"
                  value={tokenLimit}
                  onChange={(e) => setTokenLimit(parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors text-sm"
                />
              </div>
            </div>
            {error && <p className="mt-2 text-red-600 text-xs">{error}</p>}
            {debugInfo && <p className="mt-2 text-blue-600 text-xs bg-blue-50 p-2 rounded overflow-auto max-h-16">{debugInfo}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2 text-sm">Quick Select</label>
            <div className="flex flex-wrap gap-2">
              {presetLimits.map((limit) => (
                <button
                  key={limit}
                  onClick={() => setTokenLimit(limit)}
                  className={`px-3 py-1 rounded-md transition-colors text-xs ${
                    tokenLimit === limit
                      ? 'bg-yellow-400 text-gray-800 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {limit.toLocaleString()} Tokens
                </button>
              ))}
            </div>
          </div>
          
          {/* Add a small number option for testing */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2 text-sm">Test Amounts</label>
            <div className="flex flex-wrap gap-2">
              {[10, 50, 100].map((limit) => (
                <button
                  key={`test-${limit}`}
                  onClick={() => setTokenLimit(limit)}
                  className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
                >
                  {limit.toLocaleString()} Tokens (Test)
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <h3 className="font-medium text-gray-800 mb-2 text-sm">Payment Summary</h3>
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-gray-600">Token Rate</span>
              <span className="text-gray-800">₿0.0000001 / token</span>
            </div>
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-gray-600">Total Tokens</span>
              <span className="text-gray-800">{tokenLimit.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between font-medium text-sm">
              <span className="text-gray-700">Total Amount</span>
              <span className="text-gray-900">₿{(tokenLimit * 0.0000001).toFixed(8)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span></span>
              <span className="text-gray-600">{paymentAmount.toLocaleString()} sats</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            Back
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || tokenLimit <= 0}
            className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
              isSubmitting || tokenLimit <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-400 text-gray-800 hover:bg-yellow-500'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Pay with Lightning'}
          </button>
        </div>
      </div>
      
      {showPaymentModal && (
        <LightningPaymentModal
          invoice={invoice}
          onClose={handleClosePaymentModal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};