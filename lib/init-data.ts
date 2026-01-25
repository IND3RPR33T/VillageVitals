// Initialize test data for Village Vital web app
// This creates sample data if none exists

import {
    collection,
    doc,
    setDoc,
    addDoc,
    getDocs,
    query,
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

// Check if we have any data
export async function hasData(): Promise<boolean> {
    try {
        const healthReportsSnapshot = await getDocs(query(collection(db, 'health_reports'), limit(1)));
        const waterTestsSnapshot = await getDocs(query(collection(db, 'water_quality_tests'), limit(1)));
        const alertsSnapshot = await getDocs(query(collection(db, 'alerts'), limit(1)));

        return healthReportsSnapshot.docs.length > 0 || 
               waterTestsSnapshot.docs.length > 0 || 
               alertsSnapshot.docs.length > 0;
    } catch (error) {
        console.error('Error checking for existing data:', error);
        return false;
    }
}

// Initialize sample data
export async function initializeSampleData(): Promise<void> {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('User not authenticated, skipping data initialization');
            return;
        }

        console.log('Initializing sample data...');

        // Sample health reports
        const healthReports = [
            {
                reportId: 'HR001',
                reportedBy: user.uid,
                reporterName: user.displayName || 'Test User',
                reporterEmail: user.email || '',
                villageName: 'Riverside Village',
                state: 'Maharashtra',
                symptoms: ['fever', 'diarrhea', 'nausea'],
                severity: 'medium' as const,
                numberOfCases: 5,
                description: 'Multiple cases of fever and diarrhea reported in the village',
                status: 'active' as const,
                location: {
                    latitude: 19.0760,
                    longitude: 72.8777,
                    address: 'Riverside Village, Maharashtra'
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            {
                reportId: 'HR002',
                reportedBy: user.uid,
                reporterName: user.displayName || 'Test User',
                reporterEmail: user.email || '',
                villageName: 'Mountain View',
                state: 'Himachal Pradesh',
                symptoms: ['stomach_pain', 'vomiting'],
                severity: 'high' as const,
                numberOfCases: 8,
                description: 'Possible food poisoning outbreak',
                status: 'under_review' as const,
                location: {
                    latitude: 32.2432,
                    longitude: 77.1892,
                    address: 'Mountain View, Himachal Pradesh'
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            {
                reportId: 'HR003',
                reportedBy: user.uid,
                reporterName: user.displayName || 'Test User',
                reporterEmail: user.email || '',
                villageName: 'Coastal Town',
                state: 'Gujarat',
                symptoms: ['cough', 'fever'],
                severity: 'low' as const,
                numberOfCases: 2,
                description: 'Minor cold symptoms in two residents',
                status: 'resolved' as const,
                location: {
                    latitude: 22.3072,
                    longitude: 73.1812,
                    address: 'Coastal Town, Gujarat'
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }
        ];

        // Sample water quality tests
        const waterQualityTests = [
            {
                testId: 'WQT001',
                testedBy: user.uid,
                testerName: user.displayName || 'Test User',
                testerEmail: user.email || '',
                testType: 'chemical',
                waterSource: {
                    sourceId: 'WS001',
                    sourceName: 'Village Well #1',
                    sourceType: 'well',
                    location: {
                        latitude: 19.0760,
                        longitude: 72.8777,
                        address: 'Village Center, Riverside Village'
                    }
                },
                testResults: {
                    pH: 7.2,
                    turbidity: 2.1,
                    chlorine: 0.5,
                    bacteria: 'negative',
                    chemicals: 'within_limits'
                },
                riskAssessment: {
                    level: 'low',
                    score: 85,
                    recommendations: ['Monitor regularly', 'Continue current treatment']
                },
                status: 'completed',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            {
                testId: 'WQT002',
                testedBy: user.uid,
                testerName: user.displayName || 'Test User',
                testerEmail: user.email || '',
                testType: 'bacterial',
                waterSource: {
                    sourceId: 'WS002',
                    sourceName: 'Community Tap',
                    sourceType: 'tap',
                    location: {
                        latitude: 18.9750,
                        longitude: 72.8258,
                        address: 'Main Street, Mountain View'
                    }
                },
                testResults: {
                    pH: 6.8,
                    turbidity: 8.5,
                    bacteria: 'present',
                    coliform: 'high'
                },
                riskAssessment: {
                    level: 'high',
                    score: 35,
                    recommendations: ['Immediate disinfection required', 'Avoid drinking until treated']
                },
                status: 'completed',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            {
                testId: 'WQT003',
                testedBy: user.uid,
                testerName: user.displayName || 'Test User',
                testerEmail: user.email || '',
                testType: 'visual',
                waterSource: {
                    sourceId: 'WS003',
                    sourceName: 'River Source',
                    sourceType: 'river',
                    location: {
                        latitude: 22.3072,
                        longitude: 73.1812,
                        address: 'River Bank, Coastal Town'
                    }
                },
                testResults: {
                    color: 'slightly_cloudy',
                    odor: 'none',
                    taste: 'normal',
                    debris: 'minimal'
                },
                riskAssessment: {
                    level: 'moderate',
                    score: 65,
                    recommendations: ['Filter before use', 'Test chemically soon']
                },
                status: 'completed',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }
        ];

        // Sample alerts
        const alerts = [
            {
                alertId: 'AL001',
                createdBy: user.uid,
                creatorName: user.displayName || 'Health Official',
                title: 'Water Contamination Alert',
                message: 'High bacteria levels detected in Community Tap. Avoid drinking until further notice.',
                type: 'water_quality',
                severity: 'critical',
                isActive: true,
                affectedAreas: ['Mountain View'],
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            {
                alertId: 'AL002',
                createdBy: user.uid,
                creatorName: user.displayName || 'Health Official',
                title: 'Health Advisory',
                message: 'Increase in fever cases reported. Practice good hygiene and seek medical attention if symptoms persist.',
                type: 'health',
                severity: 'medium',
                isActive: true,
                affectedAreas: ['Riverside Village'],
                expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            }
        ];

        // Add health reports
        for (const report of healthReports) {
            await addDoc(collection(db, 'health_reports'), report);
        }

        // Add water quality tests
        for (const test of waterQualityTests) {
            await addDoc(collection(db, 'water_quality_tests'), test);
        }

        // Add alerts
        for (const alert of alerts) {
            await addDoc(collection(db, 'alerts'), alert);
        }

        console.log('Sample data initialized successfully!');
    } catch (error) {
        console.error('Error initializing sample data:', error);
        throw error;
    }
}

// Initialize data if none exists
export async function initializeDataIfEmpty(): Promise<void> {
    try {
        const dataExists = await hasData();
        if (!dataExists) {
            await initializeSampleData();
            console.log('✅ Sample data has been created');
        } else {
            console.log('📊 Data already exists, skipping initialization');
        }
    } catch (error) {
        console.error('Failed to initialize data:', error);
    }
}