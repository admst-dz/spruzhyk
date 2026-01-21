import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Вставьте сюда ключи из Firebase Console
const firebaseConfig = {
    apiKey: "ТУТ_ВАШ_КЛЮЧ",
    authDomain: "spruzhyk-app.firebaseapp.com",
    projectId: "spruzhyk-app",
    storageBucket: "spruzhyk-app.appspot.com",
    messagingSenderId: "...",
    appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userRef);
    if (!userSnapshot.exists()) {
        try {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                role: 'client',
                createdAt: new Date(),
                ...additionalData
            });
        } catch (error) { console.log('Error creating user', error); }
    }
    return userRef;
};

export const getUserRole = async (uid) => {
    if (!uid) return null;
    const userSnap = await getDoc(doc(db, "users", uid));
    if (userSnap.exists()) return userSnap.data().role;
    return null;
};