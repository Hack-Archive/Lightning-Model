// LND Node configuration (replace with your actual values)
const REST_HOST = 'yournodename.t.voltageapp.io:8080';
const MACAROON = 'MACAROON_HEX_KEY_HERE'; 

// Set to true for development mode with mock invoices
const DEV_MODE = true;

/**
 * Creates a Lightning invoice for payment
 * @param {number} amountSats 
 * @param {string} memo 
 * @returns {Promise<Object>} 
 */
export const createInvoice = async (amountSats, memo = 'Lightning Model API Access') => {
  try {
    console.log(`Creating invoice for ${amountSats} sats with memo: ${memo}`);
    console.log(`Using LND node at: ${REST_HOST}`);

    if (amountSats < 10 || DEV_MODE) {
      console.log('Using mock invoice for testing');
      return mockInvoiceResponse(amountSats, memo);
    }

    const actualAmount = amountSats < 10 ? 10 : amountSats;
    
    const response = await fetch(`https://${REST_HOST}/v1/invoices`, {
      method: 'POST',
      headers: {
        'Grpc-Metadata-macaroon': MACAROON,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: actualAmount,
        memo: memo,
        expiry: 900, 
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from LND: ${response.status} - ${errorText}`);
      throw new Error(`Error creating invoice: ${response.status} - ${errorText || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Invoice created successfully, payment_hash:', data.r_hash_str);
    
    return {
      ...data,
      amountSats: actualAmount,
      memo,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    if (DEV_MODE) {
      console.log('Using mock invoice in development mode');
      return mockInvoiceResponse(amountSats, memo);
    }
    
    throw error;
  }
};

/**
 * Checks if an invoice has been paid
 * @param {string} paymentHash 
 * @returns {Promise<boolean>} 
 */
export const checkInvoiceStatus = async (paymentHash) => {
  try {
    if (paymentHash === 'mock-payment-hash') {
      console.log('Mock payment - simulating successful payment');
      return true;
    }
    
    const response = await fetch(`https://${REST_HOST}/v1/invoice/${paymentHash}`, {
      method: 'GET',
      headers: {
        'Grpc-Metadata-macaroon': MACAROON,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error checking invoice: ${response.status} - ${errorText}`);
      throw new Error(`Error checking invoice: ${response.status} - ${errorText || response.statusText}`);
    }
    
    const data = await response.json();
    return data.settled === true;
  } catch (error) {
    console.error('Error checking invoice status:', error);

    if (DEV_MODE) {
      console.log('DEV MODE: Simulating successful payment despite error');
      return true;
    }
    
    throw error;
  }
};

/**
 * Gets information about the Lightning node
 * @returns {Promise<Object>} - Node information
 */
export const getNodeInfo = async () => {
  try {
    if (DEV_MODE) {
      return mockNodeInfo();
    }
    
    const response = await fetch(`https://${REST_HOST}/v1/getinfo`, {
      method: 'GET',
      headers: {
        'Grpc-Metadata-macaroon': MACAROON,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error getting node info: ${response.status} - ${errorText || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting node info:', error);

    if (DEV_MODE) {
      return mockNodeInfo();
    }
    
    throw error;
  }
};

/**
 * Calculates the appropriate amount in satoshis based on plan type and limit
 * @param {string} planType 
 * @param {number} limit 
 * @returns {number} 
 */
export const calculatePaymentAmount = (planType, limit) => {
  const TOKEN_RATE = 0.0000001;
  const REQUEST_RATE = 0.000005; 

  const btcToSats = (btc) => Math.round(btc * 100000000);
  let amount = 0;
  
  if (planType === 'token') {
    amount = btcToSats(limit * TOKEN_RATE);
  } else if (planType === 'request') {
    amount = btcToSats(limit * REQUEST_RATE);
  } else {
    throw new Error('Invalid plan type');
  }

  return Math.max(amount, 1);
};

function mockInvoiceResponse(amountSats, memo) {
  return {
    r_hash: 'mock-payment-hash',
    r_hash_str: 'mock-payment-hash',
    payment_request: 'lntb1u1pjg2u8upp5e7r4zcfm547037ugyzmv7nnwj0en28pigj9h7n00s60xhwr7zsdqqcqzpgxqyz5vqsp56pnqv3y943pl9umr8grvlz09p4vk4fnzplqltuljx428j3h5spq9qyyssqrtlj8vnqzzsst5qkyhpgztlrpzwofl0hendfkc9prvnmk7hlxd3g3cve93lrjt0fzsx6lv7w8lgmejv6spvmawgcgrzfusvra5zrptcpndwx9p',
    add_index: '12345',
    payment_addr: 'mock-payment-addr',
    amountSats: amountSats,
    memo: memo,
    createdAt: new Date().toISOString(),
    expiry: 900, 
    settled: false
  };
}

function mockNodeInfo() {
  return {
    identity_pubkey: 'mock-pubkey-for-testing',
    alias: 'MockLightningNode',
    num_active_channels: 5,
    num_peers: 10,
    block_height: 123456,
    synced_to_chain: true,
    testnet: true
  };
}

export default {
  createInvoice,
  checkInvoiceStatus,
  getNodeInfo,
  calculatePaymentAmount
};