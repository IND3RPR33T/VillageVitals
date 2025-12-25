# Prisma Setup for Village Vitals

## Current Status

✅ **Prisma Schema Created**: Located at `prisma/schema.prisma`  
✅ **Prisma Client Generated**: Available in `node_modules/@prisma/client`  
✅ **Database Service Layer**: Alternative Prisma implementation in `lib/db-prisma.ts`  
🔄 **Database Sync**: Pending due to connection issues (can be done later)  

## Prisma Schema Location

The Prisma schema is located at:
```
prisma/schema.prisma
```

## What's Been Set Up

### 1. Complete Database Schema

The Prisma schema includes all tables for Village Vitals:

- **Users** - User accounts with roles (community, health-worker, admin)
- **OTP Codes** - Email verification system
- **Health Reports** - Community health monitoring
- **Water Quality Reports** - Water safety tracking  
- **Alerts** - System notifications and warnings

### 2. Type-Safe Services

Created comprehensive Prisma service classes in `lib/db-prisma.ts`:

- `PrismaUserService` - User management
- `PrismaOTPService` - OTP verification
- `PrismaHealthReportService` - Health reporting
- `PrismaWaterQualityService` - Water quality monitoring
- `PrismaAlertService` - Alert management

### 3. Enums and Relations

Properly defined TypeScript enums and database relationships:
- User roles with proper mapping
- Report severity levels
- Water contamination levels  
- Alert types and audiences

## Current vs Prisma Implementation

### Current (Working) ✅
- Uses `@neondatabase/serverless` with raw SQL
- Direct database queries in `lib/db.ts`
- Fully functional authentication and user management

### Prisma (Alternative) 🔄  
- Type-safe database operations
- Auto-generated TypeScript types
- Relationship management
- Migration support

## How to Use Both Approaches

### Option 1: Keep Current Implementation (Recommended)
Your current setup is working perfectly! You can continue using the existing `lib/db.ts` functions.

### Option 2: Switch to Prisma
When you're ready to use Prisma:

1. **Ensure Database Connection**:
   ```bash
   npx prisma db push
   ```

2. **Replace imports in API routes**:
   ```typescript
   // Instead of:
   import { getUserById } from '@/lib/db'
   
   // Use:
   import { PrismaUserService } from '@/lib/db-prisma'
   const user = await PrismaUserService.getUserById(id)
   ```

3. **Generate Types**:
   ```bash
   npx prisma generate
   ```

### Option 3: Hybrid Approach
Use Prisma for new features while keeping existing auth system.

## Prisma Commands

```bash
# Generate client after schema changes
npx prisma generate

# Push schema to database
npx prisma db push

# View data in Prisma Studio
npx prisma studio

# Create and run migrations
npx prisma migrate dev --name init

# Reset database (careful!)
npx prisma db push --force-reset
```

## Example Usage

### User Management with Prisma

```typescript
import { PrismaUserService } from '@/lib/db-prisma'

// Create user
const newUser = await PrismaUserService.createUser({
  firstName: 'John',
  lastName: 'Doe', 
  email: 'john@example.com',
  phone: '+1234567890',
  passwordHash: 'hashed_password',
  role: 'community'
})

// Get user
const user = await PrismaUserService.getUserById(1)

// Update user
const updated = await PrismaUserService.updateUser(1, {
  firstName: 'Jane',
  role: 'health_worker'
})
```

### Health Reports with Prisma

```typescript
import { PrismaHealthReportService } from '@/lib/db-prisma'

// Create health report
const report = await PrismaHealthReportService.createHealthReport({
  userId: 1,
  villageName: 'Kamakhya Village',
  symptoms: 'Fever, headache',
  severity: 'medium',
  locationLat: 26.1658,
  locationLng: 91.7086
})

// Get reports with filtering
const reports = await PrismaHealthReportService.getHealthReports({
  severity: 'high',
  status: 'active',
  limit: 10
})
```

## Database Schema Overview

```prisma
model User {
  id           Int      @id @default(autoincrement())
  firstName    String   @map("first_name")
  lastName     String   @map("last_name")
  email        String   @unique
  phone        String   @unique
  passwordHash String   @map("password_hash")
  role         UserRole
  isVerified   Boolean  @default(false)
  
  healthReports       HealthReport[]
  waterQualityReports WaterQualityReport[]
  alerts              Alert[]
  
  @@map("users")
}

enum UserRole {
  community
  health_worker @map("health-worker")
  admin
}
```

## Next Steps

1. **Test Connection**: Try `npx prisma db push` when Neon is accessible
2. **Choose Approach**: Decide whether to migrate to Prisma or keep current setup  
3. **Implement Features**: Use either approach for new health/water quality features
4. **Type Safety**: Leverage Prisma's generated types for better development experience

## Benefits of Prisma

- **Type Safety**: Auto-generated TypeScript types
- **Relationships**: Easy to navigate data relationships  
- **Migrations**: Version-controlled database changes
- **Introspection**: Automatically sync with existing database
- **Studio**: Visual database browser
- **Performance**: Optimized queries and connection pooling

Your current implementation is excellent and production-ready. Prisma offers additional benefits for larger applications with complex relationships and team development.
