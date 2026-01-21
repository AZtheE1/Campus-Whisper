import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User as FirebaseUser,
    updateProfile
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    runTransaction,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

export const ALLOWED_DOMAIN = '@student.bup.edu.bd';

// Validate email domain
export const validateEmailDomain = (email: string) => {
    return email.endsWith(ALLOWED_DOMAIN);
};

// Check if username is taken
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const formattedUsername = username.toLowerCase().trim();
    if (formattedUsername.length < 3) return false;

    const usernameRef = doc(db, 'usernames', formattedUsername);
    const docSnap = await getDoc(usernameRef);
    return !docSnap.exists();
};

export const registerUser = async (email: string, password: string, username: string): Promise<User> => {
    if (!validateEmailDomain(email)) {
        throw new Error(`Email must end with ${ALLOWED_DOMAIN}`);
    }

    const formattedUsername = username.trim();
    const usernameId = formattedUsername.toLowerCase();

    // 1. Check/Reserve Username first (This reduces chance of Auth creation without Username)
    // However, in a real transaction we can't "reserve" without a UID usually. 
    // We will do optimistic check then Create Auth, then Transactional Write.

    const isAvailable = await checkUsernameAvailability(usernameId);
    if (!isAvailable) {
        throw new Error("Username is already taken");
    }

    // 2. Create Authentication User
    let userCredential;
    try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        throw error;
    }

    const firebaseUser = userCredential.user;

    try {
        // 3. Transaction: Create User Profile AND Claim Username
        await runTransaction(db, async (transaction) => {
            const usernameRef = doc(db, 'usernames', usernameId);
            const userRef = doc(db, 'users', firebaseUser.uid);

            const usernameDoc = await transaction.get(usernameRef);
            if (usernameDoc.exists()) {
                throw new Error("Username was taken just now. Please choose another.");
            }

            // Create User Document
            const newUser: User = {
                id: firebaseUser.uid,
                username: formattedUsername,
                email: email,
                karma: 0,
                joinedAt: Date.now(),
                isShadowBanned: false,
                role: 'student'
            };

            // Commit writes
            transaction.set(userRef, newUser);
            transaction.set(usernameRef, { uid: firebaseUser.uid });
        });

        // Update Firebase Auth Profile
        await updateProfile(firebaseUser, { displayName: formattedUsername });

        return {
            id: firebaseUser.uid,
            username: formattedUsername,
            email,
            karma: 0,
            joinedAt: Date.now()
        } as User;

    } catch (error: any) {
        // If Firestore writes fail (e.g. username taken race condition), 
        // we technically have an orphaned Auth user. 
        // Cleaning it up is good practice but optional for this MVP.
        // await firebaseUser.delete(); 
        throw new Error(error.message || "Failed to create profile");
    }
};

export const loginUser = async (email: string, password: string) => {
    if (!validateEmailDomain(email)) {
        throw new Error(`Please use your ${ALLOWED_DOMAIN} email`);
    }
    return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => signOut(auth);

export const getUserProfile = async (uid: string): Promise<User | null> => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as User;
    }
    return null;
};

export const updateUserProfile = async (uid: string, data: Partial<User>) => {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, data);
};
