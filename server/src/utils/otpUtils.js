// Generate a random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate OTP expiry time (10 minutes from now)
export const generateOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

// Verify OTP
export const verifyOTP = (storedOTP, providedOTP, expiryTime) => {
  // Check if OTP has expired
  if (new Date() > expiryTime) {
    return {
      isValid: false,
      message: 'OTP has expired. Please request a new one.'
    };
  }

  // Check if OTP matches
  if (storedOTP !== providedOTP) {
    return {
      isValid: false,
      message: 'Invalid OTP. Please try again.'
    };
  }

  return {
    isValid: true,
    message: 'OTP verified successfully'
  };
};
