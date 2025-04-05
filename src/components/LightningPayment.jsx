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