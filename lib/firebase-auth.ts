// Firebase Authentication Service for Village Vital web app
// Replaces the Neon PostgreSQL + JWT authentication

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'community' | 'health-worker' | 'admin';
    isVerified: boolean;
    createdAt: any;
    updatedAt: any;
}

// Sign up with email and password
export async function signUp(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'community' | 'health-worker' | 'admin';
}): Promise<UserProfile> {
    try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, {
            displayName: `${data.firstName} ${data.lastName}`
        });

        // Create user profile in Firestore
        const userProfile: UserProfile = {
            uid: user.uid,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || '',
            role: data.role,
            isVerified: true, // Firebase handles email verification
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);

        return userProfile;
    } catch (error: any) {
        console.error('Sign up error:', error);
        throw new Error(getFirebaseErrorMessage(error.code));
    }
}

// Sign in with email and password
export async function signIn(data: {
    email: string;
    password: string;
}): Promise<UserProfile> {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );
        const user = userCredential.user;

        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }

        // Return basic profile if Firestore doc doesn't exist
        return {
            uid: user.uid,
            email: user.email || '',
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            role: 'community',
            isVerified: user.emailVerified,
            createdAt: null,
            updatedAt: null,
        };
    } catch (error: any) {
        console.error('Sign in error:', error);
        throw new Error(getFirebaseErrorMessage(error.code));
    }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<UserProfile> {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user profile exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }

        // Create new profile for Google user
        const names = user.displayName?.split(' ') || [''];
        const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            phone: user.phoneNumber || '',
            role: 'community',
            isVerified: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
        return userProfile;
    } catch (error: any) {
        console.error('Google sign in error:', error);
        throw new Error(getFirebaseErrorMessage(error.code));
    }
}

// Sign out
export async function logOut(): Promise<void> {
    try {
        await signOut(auth);
    } catch (error: any) {
        console.error('Sign out error:', error);
        throw new Error('Failed to sign out');
    }
}

// Get current user
export function getCurrentUser(): User | null {
    return auth.currentUser;
}

// Get current user profile from Firestore
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

// Update user profile
export async function updateUserProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
}): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    try {
        // Update Firestore
        await updateDoc(doc(db, 'users', user.uid), {
            ...data,
            updatedAt: serverTimestamp(),
        });

        // Update display name if changed
        if (data.firstName || data.lastName) {
            const profile = await getCurrentUserProfile();
            const firstName = data.firstName || profile?.firstName || '';
            const lastName = data.lastName || profile?.lastName || '';
            await updateProfile(user, {
                displayName: `${firstName} ${lastName}`
            });
        }
    } catch (error: any) {
        console.error('Update profile error:', error);
        throw new Error('Failed to update profile');
    }
}

// Password reset
export async function resetPassword(email: string): Promise<void> {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error('Password reset error:', error);
        throw new Error(getFirebaseErrorMessage(error.code));
    }
}

// Auth state listener
export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

// Helper to convert Firebase error codes to user-friendly messages
function getFirebaseErrorMessage(code: string): string {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please login instead.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/operation-not-allowed':
            return 'Email/password accounts are not enabled.';
        case 'auth/weak-password':
            return 'Password is too weak. Use at least 6 characters.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/popup-closed-by-user':
            return 'Sign-in popup was closed. Please try again.';
        default:
            return 'An error occurred. Please try again.';
    }
}
