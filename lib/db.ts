import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

export const sql = neon(process.env.DATABASE_URL);

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
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
      )
    `;

    // Create OTP table for email verification
    await sql`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create health reports table
    await sql`
      CREATE TABLE IF NOT EXISTS health_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        village_name VARCHAR(255),
        symptoms TEXT,
        severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        location_lat DECIMAL,
        location_lng DECIMAL,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'under_review')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create water quality reports table
    await sql`
      CREATE TABLE IF NOT EXISTS water_quality_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        location VARCHAR(255),
        ph_level DECIMAL,
        turbidity DECIMAL,
        contamination_level VARCHAR(50) CHECK (contamination_level IN ('safe', 'moderate', 'unsafe', 'critical')),
        location_lat DECIMAL,
        location_lng DECIMAL,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'under_review')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) CHECK (type IN ('health', 'water', 'emergency', 'general')),
        severity VARCHAR(50) CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
        target_audience VARCHAR(50) CHECK (target_audience IN ('all', 'health-workers', 'community', 'admins')),
        location VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Helper function to get user by email or phone
export async function getUserByEmailOrPhone(emailOrPhone: string) {
  const result = await sql`
    SELECT * FROM users 
    WHERE email = ${emailOrPhone} OR phone = ${emailOrPhone}
    LIMIT 1
  `;
  return result[0];
}

// Helper function to get user by ID
export async function getUserById(id: number) {
  const result = await sql`
    SELECT id, first_name, last_name, email, phone, role, is_verified, created_at 
    FROM users 
    WHERE id = ${id}
    LIMIT 1
  `;
  return result[0];
}

// Helper function to create user
export async function createUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: string;
}) {
  const result = await sql`
    INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
    VALUES (${userData.firstName}, ${userData.lastName}, ${userData.email}, ${userData.phone}, ${userData.passwordHash}, ${userData.role})
    RETURNING id, first_name, last_name, email, phone, role, is_verified, created_at
  `;
  return result[0];
}

// Helper function to verify user
export async function verifyUser(email: string) {
  const result = await sql`
    UPDATE users 
    SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE email = ${email}
    RETURNING id, first_name, last_name, email, phone, role, is_verified
  `;
  return result[0];
}

// OTP functions
export async function createOTP(email: string, otpCode: string) {
  // Set OTP to expire in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  await sql`
    INSERT INTO otp_codes (email, otp_code, expires_at)
    VALUES (${email}, ${otpCode}, ${expiresAt})
  `;
}

export async function verifyOTP(email: string, otpCode: string) {
  const result = await sql`
    SELECT * FROM otp_codes 
    WHERE email = ${email} 
    AND otp_code = ${otpCode} 
    AND expires_at > NOW() 
    AND used = FALSE
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (result.length > 0) {
    // Mark OTP as used
    await sql`
      UPDATE otp_codes 
      SET used = TRUE 
      WHERE id = ${result[0].id}
    `;
    return true;
  }
  return false;
}
