import axios from 'axios';

const MPESA_API_URL = process.env.MPESA_API_URL || 'https://api.safaricom.co.ke/mpesa';
const MPESA_OAUTH_URL = process.env.MPESA_OAUTH_URL || 'https://api.safaricom.co.ke/oauth/v1/generate';
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL || `${process.env.API_URL || 'https://sunland-ordering-system.onrender.com'}/api/payments/callback`;
const AIRTEL_API_URL = process.env.AIRTEL_API_URL || 'https://api.airtel.africa';
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || process.env.MPESA_BUSINESS_SHORT_CODE || '';
const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE || process.env.MPESA_SHORTCODE || '';
// Buy Goods number (shortcode/till) to use for Customer Buy Goods transactions
const BUY_GOODS_NUMBER = process.env.MPESA_BUY_GOODS_NUMBER || '';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || '';
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '3oj5PVvsQGg9ES8zFbEqULK4aEH2L9rOixpftrc4IFtuwIGZ';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'uLjJAKTZNOnQwQZe93NVUrvopFJUIG8S6ylcsHzNKdeCkiuzjc1QUJlAKnXAwePF';
const AIRTEL_API_KEY = process.env.AIRTEL_API_KEY || '';

// Cache for access tokens
let mpesaAccessToken = null;
let mpesaTokenExpiry = null;

const normalizePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  const digits = String(phoneNumber).trim().replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.startsWith('7')) return `254${digits}`;

  return digits;
};

/**
 * Get M-Pesa access token using consumer key and secret
 * Internal function with caching for performance
 */
const getMpesaAccessToken = async () => {
  try {
    // Check if we have a valid cached token
    if (mpesaAccessToken && mpesaTokenExpiry && new Date() < mpesaTokenExpiry) {
      return mpesaAccessToken;
    }

    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    
    const response = await axios.get(`${MPESA_OAUTH_URL}?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    mpesaAccessToken = response.data.access_token;
    // Token expires in ~3600 seconds; cache for 3500 seconds to be safe
    mpesaTokenExpiry = new Date(Date.now() + 3500 * 1000);
    
    console.log('M-Pesa access token obtained successfully');
    return mpesaAccessToken;
  } catch (error) {
    console.error('M-Pesa OAuth error:', error.response?.data || error.message);
    throw new Error('Failed to obtain M-Pesa access token');
  }
};

/**
 * Public function to generate M-Pesa access token
 * Can be used for testing or refreshing the token
 * @param {boolean} forceRefresh - If true, bypass cache and get a fresh token
 * @returns {Promise<string>} - Access token
 */
export const generateMpesaAccessToken = async (forceRefresh = false) => {
  try {
    if (forceRefresh) {
      // Clear cache to force a fresh token
      mpesaAccessToken = null;
      mpesaTokenExpiry = null;
    }

    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    
    const response = await axios.get(`${MPESA_OAUTH_URL}?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    const token = response.data.access_token;
    
    // Update cache
    mpesaAccessToken = token;
    mpesaTokenExpiry = new Date(Date.now() + 3500 * 1000);
    
    console.log('M-Pesa access token generated successfully');
    return token;
  } catch (error) {
    console.error('M-Pesa token generation error:', error.response?.data || error.message);
    throw new Error('Failed to generate M-Pesa access token');
  }
};

export const initiateMpesaPayment = async (phoneNumber, amount, orderId) => {
  try {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      throw new Error('Invalid phone number for M-Pesa STK push');
    }

    // Get access token
    const accessToken = await getMpesaAccessToken();

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const shortCode = BUSINESS_SHORT_CODE || BUY_GOODS_NUMBER || MPESA_SHORTCODE;

    const response = await axios.post(`${MPESA_API_URL}/stkpush/v1/processrequest`, {
      BusinessShortCode: shortCode,
      Password: MPESA_PASSKEY,
      Timestamp: timestamp,
      // Use Buy Goods transaction type so customer receives the STK push
      TransactionType: 'CustomerBuyGoodsOnline',
      Amount: Math.round(amount),
      PartyA: normalizedPhone,
      PartyB: shortCode,
      PhoneNumber: normalizedPhone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: orderId,
      TransactionDesc: `Order ${orderId}`
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log('M-Pesa STK push initiated:', response.data);
    
    return {
      transactionId: response.data.CheckoutRequestID,
      reference: response.data.CheckoutRequestID
    };
  } catch (error) {
    console.error('M-Pesa STK push error:', error.response?.data || error.message);
    throw new Error('Failed to initiate M-Pesa payment');
  }
};

export const initiateAirtelPayment = async (phoneNumber, amount, orderId) => {
  try {
    // Placeholder - integrate with actual Airtel Money API
    
    const response = await axios.post(`${AIRTEL_API_URL}/merchant/v2/payments/`, {
      reference: orderId,
      subscriber: {
        country: 'KE',
        msisdn: phoneNumber
      },
      transaction: {
        amount: amount,
        currency: 'KES',
        id: `${orderId}-${Date.now()}`
      },
      type: 'C2B'
    }, {
      headers: {
        'X-API-KEY': AIRTEL_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    return {
      transactionId: response.data.data.transaction.id,
      reference: response.data.data.transaction.id
    };
  } catch (error) {
    console.error('Airtel Money error:', error);
    throw new Error('Failed to initiate Airtel Money payment');
  }
};

export const verifyMpesaPayment = async (checkoutRequestId) => {
  try {
    // Placeholder - implement actual verification
    // You would query M-Pesa API to check payment status
    
    return {
      ResultCode: 0,
      ResultDesc: 'The service request has been processed successfully.'
    };
  } catch (error) {
    console.error('M-Pesa verification error:', error);
    throw error;
  }
};