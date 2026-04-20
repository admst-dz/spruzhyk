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

export const createOrderInDB = async (orderData) => {
    const docRef = await addDoc(collection(db, "Orders"), {
        ...orderData,
        status: 'new',
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

// 2. Списание токенов у пользователя (ПЛ/КЛ)
export const deductUserTokens = async (uid, amountToDeduct) => {
    const userRef = doc(db, "Users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        const currentTokens = userSnap.data().tokenBalance || 0;
        if (currentTokens >= amountToDeduct) {
            await updateDoc(userRef, { tokenBalance: currentTokens - amountToDeduct });
            return true; // Успех
        }
    }
    return false; // Недостаточно средств
};

// 3. Загрузка заказов клиента
export const fetchUserOrders = async (uid) => {
    const q = query(collection(db, "Orders"), where("userId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt ? d.data().createdAt.toDate().toLocaleDateString() : 'Сейчас' }));
};

// 4. Загрузка всех заказов (Для Дилера)
export const fetchAllOrders = async () => {
    const snap = await getDocs(collection(db, "Orders"));
    return snap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt ? d.data().createdAt.toDate().toLocaleDateString() : 'Сейчас' }));
};

// 5. Дилер: Обновление статуса заказа
export const updateOrderStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, "Orders", orderId), { status: newStatus, updatedAt: serverTimestamp() });
};