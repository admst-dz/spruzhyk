import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
    query,
    orderBy
} from "firebase/firestore";

// --- КОНФИГУРАЦИЯ ---
// Скопируйте свой объект из Firebase Console -> Project Settings
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

// --- УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ---

// 1. Проверка существования пользователя (в обеих коллекциях)
export const checkUserExists = async (uid) => {
    // Сначала ищем среди Дилеров
    const dealerSnap = await getDoc(doc(db, "Dealers", uid));
    if (dealerSnap.exists()) return { exists: true, role: 'dealer', data: dealerSnap.data() };

    // Потом среди Клиентов
    const userSnap = await getDoc(doc(db, "Users", uid));
    if (userSnap.exists()) return { exists: true, role: 'client', data: userSnap.data() };

    return { exists: false };
};

// 2. Создание профиля (с конкретной ролью)
export const createUserProfile = async (user, role) => {
    if (!user) return;

    // Выбираем коллекцию: Dealers или Users
    const collectionName = role === 'dealer' ? "Dealers" : "Users";
    const userRef = doc(db, collectionName, user.uid);

    try {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            role: role, // 'client' | 'dealer'
            createdAt: new Date(),
        });
    } catch (error) {
        console.log('Error creating user profile', error);
    }

    return userRef;
};

// 3. Получение роли текущего юзера (для логина)
export const getUserRole = async (uid) => {
    if (!uid) return null;

    // Проверяем Dealers
    const dealerSnap = await getDoc(doc(db, "Dealers", uid));
    if (dealerSnap.exists()) return 'dealer';

    // Проверяем Users
    const userSnap = await getDoc(doc(db, "Users", uid));
    if (userSnap.exists()) return 'client';

    return null; // Если юзер не найден (новый)
};


// --- УПРАВЛЕНИЕ ЗАКАЗАМИ ---

// 4. Создать заказ (доступно всем)
export const createOrder = async (orderData) => {
    try {
        const docRef = await addDoc(collection(db, "orders"), {
            ...orderData,
            status: 'new',          // Статус по умолчанию
            createdAt: serverTimestamp(), // Время сервера
            dealerId: null,         // Пока null (позже привяжем)
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

// 5. Получить все заказы (для админки Дилера)
export const getAllOrders = async () => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Форматируем Timestamp в строку даты (если есть)
            date: data.createdAt ? data.createdAt.toDate().toLocaleDateString('ru-RU') : '...'
        };
    });
};