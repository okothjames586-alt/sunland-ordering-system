# OTP Verification Implementation Guide

## Overview
The Sunland Ordering app now includes OTP (One-Time Password) verification for both registration and login, with OTPs being sent to both email and phone number.

## What's Been Implemented

### Backend Changes

#### 1. **New Authentication Endpoints**
- `POST /auth/register-request` - Initiates registration and sends OTP
- `POST /auth/register-verify` - Verifies OTP and creates the account
- `POST /auth/login-request` - Initiates login and sends OTP
- `POST /auth/login-verify` - Verifies OTP and generates JWT token
- `POST /auth/resend-otp` - Resends OTP if user didn't receive it

#### 2. **New Services**
- **emailService.js** - Handles email sending via Nodemailer
  - `sendOTPEmail()` - Sends OTP code to email
  - `sendWelcomeEmail()` - Sends welcome email after successful registration
  - Logs OTP to console if email credentials are not configured

- **smsService.js** (Modified) - Gracefully handles SMS sending
  - Now checks if Twilio credentials are provided
  - Skips SMS if credentials are missing (useful for testing)

#### 3. **Utility Functions**
- **otpUtils.js** - OTP generation and verification
  - `generateOTP()` - Generates 6-digit OTP
  - `generateOTPExpiry()` - Sets expiry time (10 minutes)
  - `verifyOTP()` - Validates OTP against stored value and expiry

#### 4. **Updated User Model**
Added new fields:
- `isEmailVerified` - Boolean flag for email verification status
- `isPhoneVerified` - Boolean flag for phone verification status
- `registrationOTP` - Temporary OTP for registration
- `registrationOTPExpiry` - Expiry time for registration OTP
- `loginOTP` - Temporary OTP for login
- `loginOTPExpiry` - Expiry time for login OTP

### Frontend Changes

#### 1. **Register Page (Register.js)**
- Added phone number input field
- Two-step registration process:
  1. Collect user details (name, email, phone, password)
  2. Send OTP to email and phone
  3. Verify OTP to complete registration
- Resend OTP functionality with 60-second cooldown
- Back to registration button if user needs to cancel

#### 2. **Login Page (Login.js)**
- Added OTP verification after password validation
- Two-step login process:
  1. Enter email and password
  2. Verify OTP sent to email and phone
- Resend OTP functionality with 60-second cooldown
- Back to login button if user needs to cancel

#### 3. **Updated Styling (Login.css & Register.css)**
Added CSS for OTP verification screens:
- `.otp-info` - Display masked email and phone
- `.otp-input` - Styled OTP input field
- `.otp-footer` - Resend and back buttons
- `.resend-btn` - Resend button with timer

## Setup Instructions

### 1. **Install Dependencies**
```bash
cd server
npm install
```

### 2. **Configure Environment Variables**
Create or update `.env` file in the server directory:

```env
# Email Configuration (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Use App Password if 2FA is enabled

# Or use any other email service provider
# EMAIL_SERVICE=outlook
# EMAIL_SERVICE=sendgrid
# etc.

# SMS Configuration (Twilio - Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# JWT Configuration
JWT_SECRET=your-secret-key

# Database
MONGODB_URI=your-mongodb-connection-string

# Server Port
PORT=5000
```

### 3. **Email Configuration Options**

#### Using Gmail:
1. Enable 2-Step Verification on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in `EMAIL_PASSWORD`

#### Using Other Services:
- **Outlook**: Use your email and password
- **SendGrid**: Set `EMAIL_SERVICE=sendgrid` and use API key
- **AWS SES**: Configure accordingly
- **Custom SMTP**: Update emailService.js with your SMTP settings

### 4. **SMS Configuration (Optional)**
If SMS sending is not configured, the system will:
- Log the OTP to the console
- Allow users to proceed with email verification only

To enable SMS:
1. Sign up for Twilio: https://www.twilio.com
2. Get your Account SID, Auth Token, and Phone Number
3. Add to `.env` file

### 5. **Running the Application**

**Development Mode:**
```bash
# Terminal 1 - Start Server
cd server
npm run dev

# Terminal 2 - Start Client
cd client
npm start
```

**Production Mode:**
```bash
cd server
npm start

cd client
npm run build
```

## How It Works

### Registration Flow
1. User enters: name, email, phone, password
2. Backend generates 6-digit OTP and sends to email + SMS
3. User receives OTP on both channels
4. User enters OTP on verification screen
5. Backend verifies OTP against stored value and expiry time
6. Account is created and marked as verified
7. Welcome email is sent

### Login Flow
1. User enters email and password
2. Backend validates credentials
3. Backend generates OTP and sends to email + SMS
4. User receives OTP on both channels
5. User enters OTP on verification screen
6. Backend verifies OTP and generates JWT token
7. User is logged in

### OTP Details
- **Format**: 6-digit numeric code
- **Validity**: 10 minutes
- **Resend**: Available after 60-second cooldown
- **Delivery**: Both email and SMS

## Testing

### Without Email Configuration
When `EMAIL_USER` and `EMAIL_PASSWORD` are not set:
- OTP will be logged to server console
- User can still proceed with verification
- SMS (if configured) will still be sent

To test, check the server logs for messages like:
```
OTP for user@example.com: 123456
```

### With Email Configuration
Once you configure email:
- OTPs will be sent to user's email
- Beautiful formatted HTML emails
- Phone number is masked in UI for security

## API Reference

### Register Request
```
POST /auth/register-request
Body: {
  name: string,
  email: string,
  phone: string,
  password: string
}
Response: {
  userId: string,
  maskedEmail: string,
  maskedPhone: string
}
```

### Register Verify
```
POST /auth/register-verify
Body: {
  userId: string,
  otp: string
}
Response: {
  message: "Registration successful",
  user: { id, name, email, phone }
}
```

### Login Request
```
POST /auth/login-request
Body: {
  email: string,
  password: string
}
Response: {
  userId: string,
  maskedEmail: string,
  maskedPhone: string
}
```

### Login Verify
```
POST /auth/login-verify
Body: {
  userId: string,
  otp: string
}
Response: {
  token: string,
  user: { id, name, email, phone, role }
}
```

### Resend OTP
```
POST /auth/resend-otp
Body: {
  userId: string,
  type: "registration" | "login"
}
Response: {
  message: "OTP resent successfully"
}
```

## Security Considerations

1. **OTP Storage**: OTPs are hashed and stored with expiry times
2. **Rate Limiting**: Implement rate limiting on OTP endpoints (recommended)
3. **Phone Masking**: Phone numbers are masked in UI responses
4. **Email Masking**: Email addresses are partially masked for privacy
5. **HTTPS**: Always use HTTPS in production
6. **Environment Variables**: Never commit `.env` file to version control

## Troubleshooting

### OTP Not Sending
1. Check server logs for errors
2. Verify email credentials in `.env`
3. Check SMTP server is accessible
4. For SMS, verify Twilio credentials

### OTP Expired
- User needs to request new OTP
- Cooldown prevents spam (60 seconds)

### Wrong OTP Error
- Ensure user is entering 6 digits
- OTP is case-sensitive (if letters included)
- Try resending OTP

## Files Modified/Created

### Backend
- `server/src/controllers/authController.js` - Updated with OTP logic
- `server/src/routes/auth.js` - Added new OTP endpoints
- `server/src/models/User.js` - Added OTP fields
- `server/src/services/emailService.js` - New email service
- `server/src/services/smsService.js` - Modified for graceful handling
- `server/src/utils/otpUtils.js` - New OTP utilities
- `server/package.json` - Added nodemailer

### Frontend
- `client/src/pages/Login.js` - Updated with OTP verification
- `client/src/pages/Register.js` - Updated with phone field and OTP
- `client/src/pages/Login.css` - Added OTP styling
- `client/src/pages/Register.css` - Added OTP styling

## Next Steps (Optional Enhancements)

1. **Add Rate Limiting** - Prevent brute force attacks
2. **Email Verification Link** - Alternative to OTP
3. **Remember Device** - Skip OTP for trusted devices
4. **Biometric Login** - Optional fingerprint/face recognition
5. **Two-Factor Authentication** - Persistent 2FA option
6. **OTP Expiry Tracking** - Show countdown to user

## Support

For issues or questions, check:
1. Console logs on both client and server
2. Email service configuration
3. SMS service configuration (if using Twilio)
4. Network connectivity
