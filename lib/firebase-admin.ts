import * as admin from 'firebase-admin';

export const initAdmin = () => {
    if (!admin.apps.length) {
        try {
            // Attempt to initialize with environment variables if available
            // If running locally without specific env vars, this might need a service account key file
            // For now, we'll try standard initialization which might pick up GOOGLE_APPLICATION_CREDENTIALS
            // or just project ID.

            // Note: For verifyIdToken to work, it needs to verify against the project.

            const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
                ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
                : undefined;

            if (serviceAccount) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                });
            } else {
                // Fallback or default init (might fail for verifyIdToken if no creds)
                // But at least the module will resolve.
                admin.initializeApp({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                });
                console.warn('Firebase Admin initialized without explicit service account. ID token verification might fail if not on GCP.');
            }
        } catch (error) {
            console.error('Firebase Admin initialization error:', error);
        }
    }
};

export const adminAuth = admin.auth;
export const adminDb = admin.firestore;
