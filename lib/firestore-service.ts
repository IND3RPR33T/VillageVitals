// Firebase Firestore service for Village Vital web app
// Provides methods for health reports, water quality tests, alerts

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { getCurrentUserRole } from './role-service';
import { normalizeRole } from './rbac/role-utils';
import { hasWriteAccess } from './rbac/permissions';

// ============== HEALTH REPORTS ==============

export interface HealthReport {
    id?: string;
    reportId: string;
    reportedBy: string;
    reporterName: string;
    reporterEmail: string;
    villageName: string;
    state: string;
    symptoms: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    numberOfCases: number;
    description?: string;
    contactInfo?: string;
    images?: string[];
    attachments?: string[]; // Alternative field name used by Flutter app
    additionalInfo?: string;
    voiceNote?: string;
    location?: {
        latitude?: number;
        longitude?: number;
        address?: string;
    };
    status: 'active' | 'resolved' | 'under_review';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export async function addHealthReport(data: {
    villageName: string;
    state: string;
    symptoms: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    numberOfCases: number;
    description?: string;
    contactInfo?: string;
    images?: string[]; // Array of Cloudinary URLs
    incidentDate?: Date;
}): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const reportId = `HR${Date.now()}`;

    const reportData: Omit<HealthReport, 'id'> = {
        reportId,
        reportedBy: user.uid,
        reporterName: user.displayName || 'Unknown',
        reporterEmail: user.email || '',
        villageName: data.villageName,
        state: data.state,
        symptoms: data.symptoms,
        severity: data.severity,
        numberOfCases: data.numberOfCases,
        description: data.description || '',
        contactInfo: data.contactInfo || '',
        images: data.images || [], // Include uploaded images
        status: 'active',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, 'health_reports'), reportData);
    console.log('Health report saved:', reportId);
    return reportId;
}

export async function getHealthReports(limitCount = 50): Promise<HealthReport[]> {
    try {
        const q = query(
            collection(db, 'health_reports'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as HealthReport[];
    } catch (error) {
        console.error('Error fetching health reports:', error);
        return [];
    }
}

export async function getUserHealthReports(userId: string, limitCount = 50): Promise<HealthReport[]> {
    try {
        const q = query(
            collection(db, 'health_reports'),
            where('reportedBy', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as HealthReport[];
    } catch (error) {
        console.error('Error fetching user health reports:', error);
        return [];
    }
}

// ============== WATER QUALITY TESTS ==============

export interface WaterQualityTest {
    id?: string;
    testId: string;
    testedBy: string;
    testerName: string;
    testerEmail: string;
    location: string;
    sourceType: string;
    gpsCoordinates?: string;
    measurements: {
        coliform: number;
        turbidity: number;
        bod: number;
        cod: number;
        nitrate: number;
        ammonia: number;
    };
    riskAssessment: {
        level: 'low' | 'moderate' | 'high';
        percentage: number;
        confidence?: number;
    };
    notes?: string;
    testDate?: Timestamp;
    status: 'pending' | 'completed' | 'verified';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export async function addWaterQualityTest(data: {
    location: string;
    sourceType: string;
    gpsCoordinates?: string;
    measurements: {
        coliform: number;
        turbidity: number;
        bod: number;
        cod: number;
        nitrate: number;
        ammonia: number;
    };
    riskAssessment: {
        level: string;
        percentage: number;
        confidence?: number;
    };
    notes?: string;
    testDate?: Date;
}): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const testId = `WQT${Date.now()}`;

    const testData: Omit<WaterQualityTest, 'id'> = {
        testId,
        testedBy: user.uid,
        testerName: user.displayName || 'Unknown',
        testerEmail: user.email || '',
        location: data.location,
        sourceType: data.sourceType,
        gpsCoordinates: data.gpsCoordinates || '',
        measurements: data.measurements,
        riskAssessment: data.riskAssessment as WaterQualityTest['riskAssessment'],
        notes: data.notes || '',
        testDate: data.testDate ? Timestamp.fromDate(data.testDate) : serverTimestamp() as Timestamp,
        status: 'completed',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
    };

    await addDoc(collection(db, 'water_quality_tests'), testData);
    console.log('Water quality test saved:', testId);
    return testId;
}

export async function getWaterQualityTests(limitCount = 50): Promise<WaterQualityTest[]> {
    try {
        const q = query(
            collection(db, 'water_quality_tests'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as WaterQualityTest[];
    } catch (error) {
        console.error('Error fetching water quality tests:', error);
        return [];
    }
}

// ============== ALERTS ==============

export interface Alert {
    id?: string;
    alertId: string;
    createdBy: string;
    creatorName: string;
    title: string;
    message: string;
    type: 'health' | 'water' | 'emergency' | 'general';
    severity: 'info' | 'warning' | 'critical' | 'emergency';
    targetAudience: 'all' | 'health-workers' | 'community' | 'admins';
    location?: string;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export async function addAlert(data: {
    title: string;
    message: string;
    type: 'health' | 'water' | 'emergency' | 'general';
    severity: 'info' | 'warning' | 'critical' | 'emergency';
    targetAudience: 'all' | 'health-workers' | 'community' | 'admins';
    location?: string;
}): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const alertId = `ALERT${Date.now()}`;

    const alertData: Omit<Alert, 'id'> = {
        alertId,
        createdBy: user.uid,
        creatorName: user.displayName || 'Unknown',
        title: data.title,
        message: data.message,
        type: data.type,
        severity: data.severity,
        targetAudience: data.targetAudience,
        location: data.location || '',
        isActive: true,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
    };

    await addDoc(collection(db, 'alerts'), alertData);
    console.log('Alert saved:', alertId);
    return alertId;
}

export async function getAlerts(limitCount = 50): Promise<Alert[]> {
    try {
        const q = query(
            collection(db, 'alerts'),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Alert[];
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }
}

// ============== OUTBREAKS (for map) ==============

export async function getOutbreaks(limitCount = 100) {
    try {
        const q = query(
            collection(db, 'outbreaks'),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching outbreaks:', error);
        return [];
    }
}

// ============== SYMPTOM REPORTS (from Flutter app) ==============

export async function getSymptomReports(limitCount = 100) {
    try {
        const q = query(
            collection(db, 'symptom_reports'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching symptom reports:', error);
        return [];
    }
}

// ============== ROLE-BASED QUERIES ==============

import { canViewAllReports, canViewAllWaterTests } from './role-service';

// Get health reports based on user role
export async function getHealthReportsForRole(limitCount = 50): Promise<HealthReport[]> {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const role = await getCurrentUserRole();

        let q;
        if (canViewAllReports(role)) {
            // Admin/Health Worker: see all reports
            q = query(
                collection(db, 'health_reports'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        } else {
            // Community User: see only own reports
            q = query(
                collection(db, 'health_reports'),
                where('reportedBy', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as HealthReport[];
    } catch (error) {
        console.error('Error fetching health reports for role:', error);
        return [];
    }
}

// Get water quality tests based on user role
export async function getWaterQualityTestsForRole(limitCount = 50): Promise<WaterQualityTest[]> {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const role = await getCurrentUserRole();

        let q;
        if (canViewAllWaterTests(role)) {
            // Admin/Health Worker: see all tests
            q = query(
                collection(db, 'water_quality_tests'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        } else {
            // Community User: see only own tests
            q = query(
                collection(db, 'water_quality_tests'),
                where('testedBy', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as WaterQualityTest[];
    } catch (error) {
        console.error('Error fetching water tests for role:', error);
        return [];
    }
}

// Get symptom reports based on user role
export async function getSymptomReportsForRole(limitCount = 100) {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const role = await getCurrentUserRole();

        let q;
        if (canViewAllReports(role)) {
            // Admin/Health Worker: see all reports
            q = query(
                collection(db, 'symptom_reports'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        } else {
            // Community User: see only own reports
            q = query(
                collection(db, 'symptom_reports'),
                where('reportedBy', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching symptom reports for role:', error);
        return [];
    }
}

// Get alerts based on user role
export async function getAlertsForRole(limitCount = 50): Promise<Alert[]> {
    try {
        const user = auth.currentUser;
        if (!user) return [];

        const role = await getCurrentUserRole();

        let q;
        if (canViewAllReports(role)) {
            // Admin/Health Worker: see all active alerts
            q = query(
                collection(db, 'alerts'),
                where('isActive', '==', true),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        } else {
            // Community User: see only public alerts or their own
            q = query(
                collection(db, 'alerts'),
                where('isActive', '==', true),
                where('targetAudience', 'in', ['all', 'community']),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Alert[];
    } catch (error) {
        console.error('Error fetching alerts for role:', error);
        return [];
    }
}

// Check if current user can delete a specific document
export async function canDeleteDocument(documentUserId: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    const role = await getCurrentUserRole();

    // Admins can delete anything
    if (role === 'admin') return true;

    // Users can only delete their own documents
    return user.uid === documentUserId;
}

// Check if current user can edit a specific document
export async function canEditDocument(documentUserId: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    const role = await getCurrentUserRole();

    // Admins can edit anything
    if (role === 'admin') return true;

    // Users can only edit their own documents
    return user.uid === documentUserId;
}

// ============== ADMIN FUNCTIONS ==============

// Get all users (admin only)
export async function getAllUsers(): Promise<any[]> {
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            uid: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching all users:', error);
        return [];
    }
}

// Get emergency alerts from Flutter app
export async function getEmergencyAlerts(limitCount = 100): Promise<any[]> {
    try {
        const q = query(
            collection(db, 'emergency_alerts'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching emergency alerts:', error);
        return [];
    }
}

// Delete document by collection and id (admin only)
export async function deleteDocument(collectionName: string, docId: string): Promise<boolean> {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        const role = await getCurrentUserRole();
        if (role !== 'admin') throw new Error('Admin access required');

        await deleteDoc(doc(db, collectionName, docId));
        console.log(`Deleted ${collectionName}/${docId}`);
        return true;
    } catch (error) {
        console.error('Error deleting document:', error);
        return false;
    }
}

// Update document status (admin only)
export async function updateDocumentStatus(
    collectionName: string,
    docId: string,
    status: string
): Promise<boolean> {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        const role = await getCurrentUserRole();
        if (role !== 'admin') throw new Error('Admin access required');

        await updateDoc(doc(db, collectionName, docId), {
            status,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating document:', error);
        return false;
    }
}

// ============== AWARENESS CONTENT ==============

export interface AwarenessContent {
    id?: string;
    title: string;
    description: string;
    content: string;
    category: 'prevention' | 'treatment' | 'hygiene' | 'nutrition' | 'emergency' | 'general';
    targetAudience?: string;
    imageUrl?: string;
    isFeatured: boolean;
    isActive: boolean;
    createdBy: string;
    createdAt: any;
    updatedAt: any;
}

// Add awareness content (ASHA_WORKER and ADMIN can create)
export async function addAwarenessContent(data: {
    title: string;
    description: string;
    content: string;
    category: string;
    imageUrl?: string;
    isFeatured?: boolean;
    targetAudience?: string;
}): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const role = await getCurrentUserRole();
    const normalizedRole = normalizeRole(role);
    
    // Allow ASHA_WORKER and ADMIN to create awareness content
    if (!hasWriteAccess(normalizedRole, 'EDUCATION')) {
        throw new Error('Insufficient permissions. Only ASHA Workers and Administrators can create awareness content.');
    }

    console.log('Creating awareness content with role:', normalizedRole);

    console.log('📝 Creating awareness content data:', {
        title: data.title,
        category: data.category,
        imageUrl: data.imageUrl || 'none',
        createdBy: user.displayName || user.email
    });

    const awarenessData: Omit<AwarenessContent, 'id'> = {
        title: data.title.trim(),
        description: data.description.trim(),
        content: data.content.trim(),
        category: data.category as AwarenessContent['category'],
        targetAudience: data.targetAudience || 'general',
        imageUrl: data.imageUrl || '',
        isFeatured: data.isFeatured || false,
        isActive: true,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'awareness_content'), awarenessData);
    console.log('✅ Awareness content saved to Firestore:');
    console.log('   ID:', docRef.id);
    console.log('   Title:', data.title);
    console.log('   Image:', data.imageUrl ? '✅' : '❌');
    return docRef.id;
}

// Get awareness content
export async function getAwarenessContent(limitCount = 50): Promise<AwarenessContent[]> {
    try {
        // Simple query without composite index requirement
        const q = query(
            collection(db, 'awareness_content'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const allContent = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as AwarenessContent[];
        
        // Filter active content client-side to avoid index requirements
        return allContent.filter(item => item.isActive !== false);
    } catch (error) {
        console.error('Error fetching awareness content:', error);
        return [];
    }
}

// Update awareness content (ASHA_WORKER and ADMIN)
export async function updateAwarenessContent(
    docId: string,
    data: Partial<AwarenessContent>
): Promise<boolean> {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        const role = await getCurrentUserRole();
        const normalizedRole = normalizeRole(role);
        
        if (!hasWriteAccess(normalizedRole, 'EDUCATION')) {
            throw new Error('Insufficient permissions.');
        }

        await updateDoc(doc(db, 'awareness_content', docId), {
            ...data,
            updatedAt: serverTimestamp()
        });
        console.log('✅ Awareness content updated:', docId);
        return true;
    } catch (error) {
        console.error('Error updating awareness content:', error);
        return false;
    }
}

// Delete awareness content (ASHA_WORKER and ADMIN)
export async function deleteAwarenessContent(docId: string): Promise<boolean> {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        const role = await getCurrentUserRole();
        const normalizedRole = normalizeRole(role);
        
        if (!hasWriteAccess(normalizedRole, 'EDUCATION')) {
            throw new Error('Insufficient permissions.');
        }

        await deleteDoc(doc(db, 'awareness_content', docId));
        console.log('✅ Awareness content deleted:', docId);
        return true;
    } catch (error) {
        console.error('Error deleting awareness content:', error);
        return false;
    }
}

