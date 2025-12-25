import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(email: string, otpCode: string, userName: string) {
  try {
    const mailOptions = {
      from: {
        name: 'VillageVitals',
        address: process.env.EMAIL_USER || 'noreply@villagevitals.com',
      },
      to: email,
      subject: 'Verify Your VillageVitals Account - OTP Code',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>VillageVitals - Verify Your Account</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 VillageVitals</h1>
            <p>Empowering Rural Healthcare</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Welcome to VillageVitals! To complete your account verification, please use the OTP code below:</p>
            
            <div class="otp-box">
              <p>Your verification code is:</p>
              <div class="otp-code">${otpCode}</div>
              <p><small>This code will expire in 10 minutes</small></p>
            </div>
            
            <p>Enter this code in the verification screen to activate your account and start using VillageVitals to contribute to your community's health monitoring.</p>
            
            <div class="warning">
              <strong>⚠️ Security Note:</strong> Never share this code with anyone. VillageVitals staff will never ask for your verification code.
            </div>
            
            <p>If you didn't request this verification, please ignore this email or contact our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The VillageVitals Team</p>
              <p><small>This is an automated email. Please do not reply to this message.</small></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        VillageVitals Account Verification
        
        Hello ${userName}!
        
        Welcome to VillageVitals! To complete your account verification, please use the following OTP code:
        
        Verification Code: ${otpCode}
        
        This code will expire in 10 minutes.
        
        Enter this code in the verification screen to activate your account.
        
        If you didn't request this verification, please ignore this email.
        
        Best regards,
        The VillageVitals Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error };
  }
}

export async function sendWelcomeEmail(email: string, userName: string) {
  try {
    const mailOptions = {
      from: {
        name: 'VillageVitals',
        address: process.env.EMAIL_USER || 'noreply@villagevitals.com',
      },
      to: email,
      subject: 'Welcome to VillageVitals - Account Verified Successfully!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to VillageVitals</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .feature-item:last-child { border-bottom: none; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome to VillageVitals!</h1>
            <p>Your account has been verified successfully</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Congratulations! Your VillageVitals account is now active and ready to use. You're now part of a community dedicated to improving rural healthcare.</p>
            
            <div class="feature-list">
              <h3>What you can do now:</h3>
              <div class="feature-item">📊 <strong>Health Reporting</strong> - Report health cases and symptoms in your community</div>
              <div class="feature-item">💧 <strong>Water Quality Monitoring</strong> - Track and report water quality issues</div>
              <div class="feature-item">🗺️ <strong>Interactive Health Map</strong> - View health data and unsafe areas</div>
              <div class="feature-item">🚨 <strong>Alert System</strong> - Create and receive important health alerts</div>
              <div class="feature-item">📚 <strong>Educational Resources</strong> - Access health education materials</div>
            </div>
            
            <p>Ready to get started? Log in to your dashboard and begin exploring the platform.</p>
            
            <div class="footer">
              <p>Need help? Contact our support team at support@villagevitals.org</p>
              <p>Best regards,<br>The VillageVitals Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error };
  }
}
