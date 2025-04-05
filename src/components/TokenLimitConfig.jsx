import React, { useState } from 'react';
import { ArrowLeft, Coins, Database } from 'lucide-react';
import { usePayment } from '../context/PaymentContext';
import LightningPaymentModal from './LightningPayment';
import { calculatePaymentAmount } from '../services/lndService';