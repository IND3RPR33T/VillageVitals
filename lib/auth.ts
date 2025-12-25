import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function comparePassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
