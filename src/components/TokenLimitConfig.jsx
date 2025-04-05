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