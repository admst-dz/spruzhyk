import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider, createUserProfile } from '../firebase';

export const AuthModal = ({ onClose }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // Вход по Email
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (isRegistering) {
                const { user } = await createUserWithEmailAndPassword(auth, email, password);
                await createUserProfile(user);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            onClose();
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    // Вход через Google
    const handleGoogle = async () => {
        try {
            const { user } = await signInWithPopup(auth, googleProvider);
            await createUserProfile(user);
            onClose();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-zen">
            <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in">

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black transition">✕</button>

                <div className="p-8">
                    <h2 className="text-3xl font-black text-center mb-2">
                        {isRegistering ? 'РЕГИСТРАЦИЯ' : 'ВХОД'}
                    </h2>
                    <p className="text-center text-gray-400 text-sm mb-8 font-bold tracking-widest">
                        ЛИЧНЫЙ КАБИНЕТ SPRUZHYK
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            type="email" placeholder="Email" required
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-black/20 text-black"
                        />
                        <input
                            type="password" placeholder="Пароль" required
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[12px] font-bold focus:outline-none focus:ring-2 focus:ring-black/20 text-black"
                        />

                        {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                        <button type="submit" className="w-full py-4 bg-black text-white rounded-[12px] font-bold tracking-widest uppercase hover:bg-gray-800 transition shadow-lg mt-2">
                            {isRegistering ? 'Создать аккаунт' : 'Войти'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="h-[1px] bg-gray-200 flex-1"></div>
                        <span className="text-gray-300 text-xs font-bold">ИЛИ</span>
                        <div className="h-[1px] bg-gray-200 flex-1"></div>
                    </div>

                    <button
                        onClick={handleGoogle}
                        className="w-full py-3 bg-white border-2 border-gray-100 text-black rounded-[12px] font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition"
                    >
                        <span className="text-xl">G</span> Google
                    </button>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-sm text-gray-500 font-bold hover:text-black underline decoration-gray-300 underline-offset-4"
                        >
                            {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}