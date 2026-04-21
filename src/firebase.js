import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, serverTimestamp, query, where, getDocs, updateDoc, writeBatch } from "firebase/firestore";

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

// Получение роли + subRole
export const getUserRole = async (uid) => {
    if (!uid) return { role: null, subRole: null };
    const dealerSnap = await getDoc(doc(db, "Dealers", uid));
    if (dealerSnap.exists()) return { role: 'dealer', subRole: null };
    const userSnap = await getDoc(doc(db, "Users", uid));
    if (userSnap.exists()) return { role: 'client', subRole: userSnap.data().subRole || 'PL' };
    return { role: null, subRole: null };
};

// Создание профиля (subRole только для клиентов)
export const createUserProfile = async (user, role, subRole = null) => {
    if (!user) return;
    const collectionName = role === 'dealer' ? "Dealers" : "Users";
    const userRef = doc(db, collectionName, user.uid);
    const data = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        role,
        createdAt: serverTimestamp(),
        ...(role === 'client' && subRole ? { subRole } : {}),
    };
    try {
        await setDoc(userRef, data);
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

// 3. Загрузка заказов клиента (включая гостевые по email)
export const fetchUserOrders = async (uid, email) => {
    const toRow = d => ({ id: d.id, ...d.data(), date: d.data().createdAt ? d.data().createdAt.toDate().toLocaleDateString() : 'Сейчас' });

    const q1 = query(collection(db, "Orders"), where("userId", "==", uid));
    const snap1 = await getDocs(q1);
    const authOrders = snap1.docs.map(toRow);

    if (!email) return authOrders;

    const q2 = query(collection(db, "Orders"), where("userEmail", "==", email), where("isGuest", "==", true));
    const snap2 = await getDocs(q2);
    const guestOrders = snap2.docs.map(toRow);

    const seen = new Set(authOrders.map(o => o.id));
    return [...authOrders, ...guestOrders.filter(o => !seen.has(o.id))];
};

// 3b. Привязать гостевые заказы к аккаунту после логина
export const claimGuestOrders = async (uid, email) => {
    if (!email) return;
    const q = query(collection(db, "Orders"), where("userEmail", "==", email), where("isGuest", "==", true));
    const snap = await getDocs(q);
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.update(d.ref, { userId: uid, isGuest: false }));
    await batch.commit();
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