import nodemailer from 'nodemailer';

const isEmailConfigured = () => {
  return !!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD;
};

const createTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

export const sendOTPEmail = async (email, otp, userName) => {
  try {
    if (!isEmailConfigured()) {
      console.log(`OTP for ${email}: ${otp}`);
      return {
        success: true,
        message: 'Email sending not configured - OTP logged to console'
      };
    }

    const transporter = createTransporter();
    if (!transporter) {
      console.log(`OTP for ${email}: ${otp}`);
      return {
        success: true,
        message: 'Email sending not configured - OTP logged to console'
      };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Sunland Bites - Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Sunland Bites</h2>
            
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              Hi ${userName},
            </p>
            
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              Your One-Time Password (OTP) for ${email} is:
            </p>
            
            <div style="background-color: #fff; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <p style="font-size: 32px; font-weight: bold; color: #FF6B35; letter-spacing: 5px; margin: 0;">
                ${otp}
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              This code will expire in 10 minutes. Please do not share this code with anyone.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'OTP sent successfully'
    };
  } catch (error) {
    console.warn('Email sending skipped:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    if (!isEmailConfigured()) {
      console.log(`Welcome email for ${email}`);
      return {
        success: true,
        message: 'Email sending not configured'
      };
    }

    const transporter = createTransporter();
    if (!transporter) {
      console.log(`Welcome email for ${email}`);
      return {
        success: true,
        message: 'Email sending not configured'
      };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Sunland Bites!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Sunland Bites!</h2>
            
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              Hi ${name},
            </p>
            
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              Your account has been successfully created. You can now log in and start ordering your favorite meals.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
              Best regards,<br>
              Sunland Bites Team
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'Welcome email sent'
    };
  } catch (error) {
    console.warn('Email sending skipped:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
