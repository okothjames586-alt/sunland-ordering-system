import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';

// Initialize Twilio client only if credentials are provided
const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) 
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) 
  : null;

export const sendSMS = async (phoneNumber, message) => {
  try {
    // Check if Twilio is configured
    if (!twilioClient || !TWILIO_PHONE_NUMBER) {
      console.warn('Twilio not configured - SMS sending skipped');
      return {
        success: false,
        error: 'Twilio credentials not configured'
      };
    }

    // Format phone number to international format if needed
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('0')) {
        formattedPhone = `+254${phoneNumber.substring(1)}`;
      } else if (phoneNumber.startsWith('254')) {
        formattedPhone = `+${phoneNumber}`;
      } else {
        formattedPhone = `+254${phoneNumber}`;
      }
    }

    // Send SMS via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`SMS sent to ${formattedPhone}, SID: ${result.sid}`);
    return {
      success: true,
      messageSid: result.sid
    };
  } catch (error) {
    console.error('SMS sending error:', error);
    // Gracefully handle SMS error - don't fail the entire request
    return {
      success: false,
      error: error.message
    };
  }
};

export const sendBulkSMS = async (phoneNumbers, message) => {
  try {
    const results = [];
    for (const phone of phoneNumbers) {
      const result = await sendSMS(phone, message);
      results.push(result);
    }
    return results;
  } catch (error) {
    console.error('Bulk SMS error:', error);
    throw error;
  }
};