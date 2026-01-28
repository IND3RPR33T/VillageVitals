import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from 'firebase-admin';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateToken } from '@/lib/auth';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
initAdmin();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { idToken, role } = body;

        if (!idToken) {
            return NextResponse.json(
                { error: 'ID token is required' },
                { status: 400 }
            );
        }

        // Verify the ID token
        const decodedToken = await adminAuth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const email = decodedToken.email;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required in token' },
                { status: 400 }
            );
        }

        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', uid);
        let userDoc = await getDoc(userDocRef);
        let userData = userDoc.data();

        if (!userDoc.exists()) {
            // Create new user if not exists
            // We need a role. If not provided, default to 'community' (or whatever logic)
            // Actually, for Google Sign In, if they are new, we might prompt for role?
            // Or just default to 'COMMUNITY_MEMBER'.

            const firstName = decodedToken.name?.split(' ')[0] || '';
            const lastName = decodedToken.name?.split(' ').slice(1).join(' ') || '';

            const newUserData = {
                uid,
                email,
                firstName,
                lastName,
                phone: decodedToken.phone_number || '',
                role: role || 'COMMUNITY_MEMBER', // Use provided role or default
                isVerified: true, // Google accounts are verified
                isActive: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                isProfileComplete: false,
            };

            await setDoc(userDocRef, newUserData);
            userData = newUserData;

            // Also save by email for legacy lookups if needed
            await setDoc(doc(db, 'users', email.toLowerCase()), newUserData);
        }

        // Generate valid session token
        const token = generateToken({
            userId: uid,
            email: email,
            role: userData?.role || 'COMMUNITY_MEMBER',
        });

        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: uid,
                email: email,
                role: userData?.role,
                isNewUser: !userDoc.exists()
            }
        });

        // Set cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60,
        });

        return response;

    } catch (error) {
        console.error('Google auth error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
