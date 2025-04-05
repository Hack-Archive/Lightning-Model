import React, { createContext, useState, useContext } from 'react';
import { createInvoice, calculatePaymentAmount } from '../services/lndService';

const PaymentContext = createContext({
  invoice: null,
  isLoading: false,
  error: null,
  createPaymentInvoice: async () => {},
  resetPayment: () => {},
});