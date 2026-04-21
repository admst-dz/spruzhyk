import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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
export const googleProvider = new GoogleAuthProvider();
