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