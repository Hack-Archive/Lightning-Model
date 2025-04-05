import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react'; 
import { Loader2, X, AlertCircle, Check, Copy, ExternalLink } from 'lucide-react';
import { checkInvoiceStatus } from '../services/lndService';

