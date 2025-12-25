# Village Vitals Backend Setup Guide

This guide will help you set up the complete backend integration for Village Vitals with Neon database, OTP verification, and user authentication.

## Prerequisites

- Node.js (v18 or later)
- A Gmail account for sending OTP emails
- Neon database account

## Step 1: Environment Setup

1. Create a `.env.local` file in the root directory by copying `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the environment variables in `.env.local`:

   - `DATABASE_URL`: Your Neon database connection string (already provided)
   - `JWT_SECRET`: Change to a secure random string for production
   - `EMAIL_USER`: Your Gmail email address
   - `EMAIL_PASS`: Your Gmail app-specific password (ilwv fgbp airl mqyp)

## Step 2: Gmail App Password Setup

The app password `ilwv fgbp airl mqyp` has been provided, but you should:

1. Go to your Google Account settings
2. Enable 2-factor authentication if not already enabled
3. Generate a new app-specific password for this application
4. Replace the EMAIL_PASS in your .env.local file

## Step 3: Database Initialization

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Initialize the database by visiting:
   ```
   http://localhost:8080/api/init-db
   ```
   
   This will create all necessary tables:
   - `users` - User accounts and profiles
   - `otp_codes` - Email verification codes
   - `health_reports` - Health monitoring data
   - `water_quality_reports` - Water quality data
   - `alerts` - System alerts and notifications

## Step 4: Test the Integration

### Test User Registration:
1. Go to `http://localhost:8080/login`
2. Switch to the "Register" tab
3. Fill out the registration form
4. Check your email for the OTP code
5. Complete the verification process

### Test User Login:
1. After verification, use the login form
2. Enter your credentials and select your role
3. You should be redirected to the dashboard

### Test Profile Management:
1. After logging in, navigate to Profile (in the sidebar)
2. View and edit your profile information
3. Test the logout functionality

## Available API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/resend-otp` - Resend OTP code
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/update-profile` - Update user profile

### Database
- `GET /api/init-db` - Initialize database tables

## User Roles

The system supports three user roles:

1. **Community Member** - Can submit health reports, report water quality issues, receive alerts
2. **Health Worker** - Can create health reports, monitor community data, send alerts
3. **Admin** - Full system access, user management, system configuration

## Features Implemented

### ✅ Backend Integration
- [x] Neon database connection
- [x] User authentication with JWT
- [x] Password hashing with bcrypt
- [x] Role-based access control

### ✅ Email System
- [x] OTP verification for signup
- [x] Welcome emails
- [x] Resend OTP functionality
- [x] Beautiful HTML email templates

### ✅ User Management
- [x] User registration with validation
- [x] Email verification required
- [x] Secure login system
- [x] Profile management
- [x] Role-based permissions

### ✅ Frontend Integration
- [x] Real-time form validation
- [x] Loading states and error handling
- [x] OTP verification UI
- [x] Profile page with edit functionality
- [x] Responsive design

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('community', 'health-worker', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### OTP Codes Table
```sql
CREATE TABLE otp_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with 24-hour expiration
- HTTP-only cookies for token storage
- Email verification required for account activation
- OTP codes expire after 10 minutes
- Input validation and sanitization
- Role-based access control

## Next Steps

1. Test the complete signup → verification → login flow
2. Customize email templates if needed
3. Add additional user profile fields as required
4. Implement health reporting functionality
5. Set up water quality monitoring
6. Configure alert systems

## Troubleshooting

### Common Issues:

1. **Database Connection Error**: Check your DATABASE_URL in .env.local
2. **Email Not Sending**: Verify Gmail app password and email settings
3. **JWT Errors**: Ensure JWT_SECRET is set and consistent
4. **OTP Verification Failed**: Check email spam folder, OTP expires in 10 minutes

### Support

If you encounter any issues, check the browser console and server logs for detailed error messages.
