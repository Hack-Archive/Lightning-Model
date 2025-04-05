import React, { useState } from 'react';
import { ArrowLeft, Database, Zap } from 'lucide-react';
import { usePayment } from '../context/PaymentContext';
import LightningPaymentModal from './LightningPayment';
import { calculatePaymentAmount } from '../services/lndService';

export const RequestLimitConfig = ({ onSubmit, onBack }) => {
  const [requestLimit, setRequestLimit] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const { invoice, createPaymentInvoice, resetPayment } = usePayment();

  const presetLimits = [50, 100, 500, 1000];

  const paymentAmount = calculatePaymentAmount('request', requestLimit);

  const handleSubmit = async () => {
    if (requestLimit <= 0) {
      setError('Request limit must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createPaymentInvoice('request', requestLimit);

      setShowPaymentModal(true);
    } catch (err) {
      setError('Failed to create payment invoice. Please try again.');
      console.error('Error creating invoice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePaymentSuccess = async () => {
    try {
      await onSubmit(requestLimit);

      setTimeout(() => {
        setShowPaymentModal(false);
        resetPayment();
      }, 2000);
    } catch (err) {
      setError('Payment was received but failed to create session. Please contact support.');
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
          <h2 className="text-xl font-bold text-gray-800">Configure API Request Limit</h2>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-lg shadow-md flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            <span className="text-base font-bold tracking-tight">Pay Per Request</span>
          </div>
        </div>

        <div className="mb-6 overflow-y-auto">
          <p className="text-gray-700 mb-4 text-sm">
            Set the total number of API requests you want to allow for this session. 
            When this limit is reached, your session will automatically terminate.
          </p>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2 text-sm">Total API Request Limit</label>
            <div className="flex">
              <div className="relative flex-1">
                <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="number"
                  min="1"
                  value={requestLimit}
                  onChange={(e) => setRequestLimit(parseInt(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors text-sm"
                />
              </div>
            </div>
            {error && <p className="mt-2 text-red-600 text-xs">{error}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2 text-sm">Quick Select</label>
            <div className="flex flex-wrap gap-2">
              {presetLimits.map((limit) => (
                <button
                  key={limit}
                  onClick={() => setRequestLimit(limit)}
                  className={`px-3 py-1 rounded-md transition-colors text-xs ${
                    requestLimit === limit
                      ? 'bg-yellow-400 text-gray-800 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {limit} Requests
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <h3 className="font-medium text-gray-800 mb-2 text-sm">Payment Summary</h3>
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-gray-600">Request Rate</span>
              <span className="text-gray-800">₿0.000005 / request</span>
            </div>
            <div className="flex justify-between mb-1 text-xs">
              <span className="text-gray-600">Total Requests</span>
              <span className="text-gray-800">{requestLimit.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between font-medium text-sm">
              <span className="text-gray-700">Total Amount</span>
              <span className="text-gray-900">₿{(requestLimit * 0.000005).toFixed(8)}</span>
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
            disabled={isSubmitting || requestLimit <= 0}
            className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
              isSubmitting || requestLimit <= 0
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