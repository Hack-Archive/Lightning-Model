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