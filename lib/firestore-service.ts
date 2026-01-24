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
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

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
        images: [],
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
