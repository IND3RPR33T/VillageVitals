// Alternative Prisma-based database service
// Use this when you want to switch from raw SQL to Prisma ORM

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Prisma-based user service functions
export class PrismaUserService {
  
  // Get user by email or phone
  static async getUserByEmailOrPhone(emailOrPhone: string) {
    return await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone }
        ]
      }
    })
  }

  // Get user by ID
  static async getUserById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
      }
    })
  }

  // Create user
  static async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: 'community' | 'health_worker' | 'admin';
  }) {
    return await prisma.user.create({
      data: userData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
      }
    })
  }

  // Verify user
  static async verifyUser(email: string) {
    return await prisma.user.update({
      where: { email },
      data: { 
        isVerified: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
      }
    })
  }

  // Update user profile
  static async updateUser(id: number, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: 'community' | 'health_worker' | 'admin';
  }) {
    return await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
      }
    })
  }
}

// Prisma-based OTP service
export class PrismaOTPService {
  
  // Create OTP
  static async createOTP(email: string, otpCode: string) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    return await prisma.otpCode.create({
      data: {
        email,
        otpCode,
        expiresAt,
      }
    })
  }

  // Verify OTP
  static async verifyOTP(email: string, otpCode: string) {
    const otp = await prisma.otpCode.findFirst({
      where: {
        email,
        otpCode,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (otp) {
      // Mark OTP as used
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { used: true }
      })
      return true
    }
    return false
  }
}

// Prisma-based Health Report service
export class PrismaHealthReportService {
  
  // Create health report
  static async createHealthReport(data: {
    userId?: number;
    villageName?: string;
    symptoms?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    locationLat?: number;
    locationLng?: number;
  }) {
    return await prisma.healthReport.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      }
    })
  }

  // Get health reports
  static async getHealthReports(filters?: {
    userId?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'active' | 'resolved' | 'under_review';
    limit?: number;
  }) {
    return await prisma.healthReport.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.severity && { severity: filters.severity }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...(filters?.limit && { take: filters.limit }),
    })
  }

  // Update health report status
  static async updateHealthReportStatus(id: number, status: 'active' | 'resolved' | 'under_review') {
    return await prisma.healthReport.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    })
  }
}

// Prisma-based Water Quality service
export class PrismaWaterQualityService {
  
  // Create water quality report
  static async createWaterQualityReport(data: {
    userId?: number;
    location?: string;
    phLevel?: number;
    turbidity?: number;
    contaminationLevel?: 'safe' | 'moderate' | 'unsafe' | 'critical';
    locationLat?: number;
    locationLng?: number;
  }) {
    return await prisma.waterQualityReport.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      }
    })
  }

  // Get water quality reports
  static async getWaterQualityReports(filters?: {
    userId?: number;
    contaminationLevel?: 'safe' | 'moderate' | 'unsafe' | 'critical';
    status?: 'active' | 'resolved' | 'under_review';
    limit?: number;
  }) {
    return await prisma.waterQualityReport.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.contaminationLevel && { contaminationLevel: filters.contaminationLevel }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...(filters?.limit && { take: filters.limit }),
    })
  }
}

// Prisma-based Alert service
export class PrismaAlertService {
  
  // Create alert
  static async createAlert(data: {
    userId?: number;
    title: string;
    message: string;
    type?: 'health' | 'water' | 'emergency' | 'general';
    severity?: 'info' | 'warning' | 'critical' | 'emergency';
    targetAudience?: 'all' | 'health_workers' | 'community' | 'admins';
    location?: string;
  }) {
    return await prisma.alert.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      }
    })
  }

  // Get active alerts
  static async getActiveAlerts(filters?: {
    type?: 'health' | 'water' | 'emergency' | 'general';
    severity?: 'info' | 'warning' | 'critical' | 'emergency';
    targetAudience?: 'all' | 'health_workers' | 'community' | 'admins';
    limit?: number;
  }) {
    return await prisma.alert.findMany({
      where: {
        isActive: true,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.severity && { severity: filters.severity }),
        ...(filters?.targetAudience && { targetAudience: filters.targetAudience }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...(filters?.limit && { take: filters.limit }),
    })
  }

  // Deactivate alert
  static async deactivateAlert(id: number) {
    return await prisma.alert.update({
      where: { id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    })
  }
}
