import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBAjNllw0Dm_wszZpHgqNhZZGs2eGhlgPM",
    authDomain: "spruzhuk.firebaseapp.com",
    projectId: "spruzhuk",
    storageBucket: "spruzhuk.firebasestorage.app",
    messagingSenderId: "570646037943",
    appId: "1:570646037943:web:d0b0e93f7a81cf64ccd432",
    measurementId: "G-BX5GJ891YK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Получение роли
export const getUserRole = async (uid) => {
    if (!uid) return null;
    const dealerSnap = await getDoc(doc(db, "Dealers", uid));
    if (dealerSnap.exists()) return 'dealer';
    const userSnap = await getDoc(doc(db, "Users", uid));
    if (userSnap.exists()) return 'client';
    return null;
};

// Создание профиля
export const createUserProfile = async (user, role) => {
    if (!user) return;
    const collectionName = role === 'dealer' ? "Dealers" : "Users";
    const userRef = doc(db, collectionName, user.uid);
    try {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            role: role,
            createdAt: new Date(),
        });
    } catch (error) { console.log('Error creating user profile', error); }
    return userRef;
};

// Проверка юзера
export const checkUserExists = async (uid) => {
    const dealerSnap = await getDoc(doc(db, "Dealers", uid));
    if (dealerSnap.exists()) return { exists: true, role: 'dealer', data: dealerSnap.data() };
    const userSnap = await getDoc(doc(db, "Users", uid));
    if (userSnap.exists()) return { exists: true, role: 'client', data: userSnap.data() };
    return { exists: false };
};