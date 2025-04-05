import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 
import { Loader2, X, AlertCircle, Check, Copy, ExternalLink } from 'lucide-react';
import { checkInvoiceStatus } from '../services/lndService';

export const LightningPaymentModal = ({ invoice, onClose, onPaymentSuccess }) => {
  const [paymentStatus, setPaymentStatus] = useState('pending'); 
  const [error, setError] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  useEffect(() => {
    if (!invoice || !invoice.r_hash) return;

    const paymentHash = invoice.r_hash_str || invoice.r_hash;
    
    const checkPayment = async () => {
      try {
        const isPaid = await checkInvoiceStatus(paymentHash);
        
        if (isPaid) {
          setPaymentStatus('success');
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
          return true; 
        }
        return false; 
      } catch (err) {
        setError('Error checking payment status');
        console.error(err);
        return true; 
      }
    };
    
    checkPayment().then(stopChecking => {
      if (stopChecking) return;

      const intervalId = setInterval(async () => {
        const stopChecking = await checkPayment();
        if (stopChecking) {
          clearInterval(intervalId);
        }
      }, 3000); 

      return () => clearInterval(intervalId);
    });

    const expiryTimeout = setTimeout(() => {
      if (paymentStatus === 'pending') {
        setPaymentStatus('expired');
      }
    }, 15 * 60 * 1000);
    
    return () => {
      clearTimeout(expiryTimeout);
    };
  }, [invoice, onPaymentSuccess, paymentStatus]);

  if (!invoice) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Lightning Payment</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          </div>
          <p className="text-center text-gray-600">Generating invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Lightning Payment</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {paymentStatus === 'success' ? (
          <div className="text-center py-6">
            <div className="bg-green-100 text-green-800 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">Your session is now active and ready to use.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Start Using Service
            </button>
          </div>
        ) : paymentStatus === 'expired' ? (
          <div className="text-center py-6">
            <div className="bg-red-100 text-red-800 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium mb-2">Invoice Expired</h3>
            <p className="text-gray-600 mb-6">The payment time has expired. Please try again.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="text-center mb-4">
                <span className="text-lg font-medium text-gray-800">
                  {invoice.amountSats} sats
                </span>
                <p className="text-sm text-gray-600">{invoice.memo}</p>
              </div>
              
              <div className="flex justify-center mb-4">
                {/* QR code for the payment */}
                <div className="bg-white p-3 rounded-lg">
                  <QRCodeSVG
                    value={invoice.payment_request || ''}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Payment Request</span>
                  <button
                    onClick={() => copyToClipboard(invoice.payment_request)}
                    className="text-yellow-600 hover:text-yellow-700 p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
                  {invoice.payment_request}
                </div>
              </div>
              
              <div className="text-center">
                <a
                  href={`lightning:${invoice.payment_request}`}
                  className="inline-flex items-center px-4 py-2 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Open in Wallet
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
            
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Waiting for payment...
            </div>
            
            {error && (
              <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LightningPaymentModal;