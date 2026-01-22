import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider, createUserProfile, checkUserExists } from '../firebase';

export const AuthModal = ({ onClose }) => {
    const [step, setStep] = useState(1); // 1: Вход, 2: Выбор роли
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // Временное хранение юзера, пока он выбирает роль
    const [tempUser, setTempUser] = useState(null);

    // Логика обработки после успешной технической авторизации
    const handleAuthSuccess = async (user) => {
        const { exists } = await checkUserExists(user.uid);

        if (exists) {
            // Если профиль уже есть - просто входим
            onClose();
        } else {
            // Если профиля нет (в любой коллекции) - ведем на выбор роли
            setTempUser(user);
            setStep(2);
        }
    };

    // Вход/Рега по Email
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            let userCredential;
            if (isRegistering) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }
            await handleAuthSuccess(userCredential.user);
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    // Вход через Google
    const handleGoogle = async () => {
        setError(null);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await handleAuthSuccess(result.user);
        } catch (err) {
            setError(err.message);
        }
    };

    // Финальный шаг: Сохранение роли
    const selectRole = async (role) => {
        if (tempUser) {
            await createUserProfile(tempUser, role);
            onClose(); // Все готово
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-zen">
            <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in">

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black transition">✕</button>

                {/* ШАГ 1: ВВОД ДАННЫХ */}
                {step === 1 && (
                    <div className="p-8">
                        <h2 className="text-3xl font-black text-center mb-2">
                            {isRegistering ? 'РЕГИСТРАЦИЯ' : 'ВХОД'}
                        </h2>
                        <p className="text-center text-gray-400 text-sm mb-8 font-bold tracking-widest uppercase">
                            Личный кабинет Spruzhyk
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input
                                type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[12px] font-bold text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                            />
                            <input
                                type="password" placeholder="Пароль" required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[12px] font-bold text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                            />

                            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                            <button type="submit" className="w-full py-4 bg-black text-white rounded-[12px] font-bold tracking-widest uppercase hover:bg-gray-800 transition shadow-lg mt-2">
                                {isRegistering ? 'Далее' : 'Войти'}
                            </button>
                        </form>

                        <div className="flex items-center gap-4 my-6">
                            <div className="h-[1px] bg-gray-200 flex-1"></div>
                            <span className="text-gray-300 text-xs font-bold">ИЛИ</span>
                            <div className="h-[1px] bg-gray-200 flex-1"></div>
                        </div>

                        <button onClick={handleGoogle} className="w-full py-3 bg-white border-2 border-gray-100 text-black rounded-[12px] font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition">
                            <span className="text-xl font-black">G</span> Google
                        </button>

                        <div className="mt-6 text-center">
                            <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-gray-500 font-bold hover:text-black underline decoration-gray-300 underline-offset-4">
                                {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ШАГ 2: ВЫБОР РОЛИ (Только для новых) */}
                {step === 2 && (
                    <div className="p-8 text-center animate-fade-in">
                        <h2 className="text-2xl font-black mb-2">КТО ВЫ?</h2>
                        <p className="text-gray-400 text-sm mb-8 font-bold">Выберите тип аккаунта для завершения регистрации</p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => selectRole('client')}
                                className="group relative w-full p-6 border-2 border-gray-100 hover:border-black rounded-[16px] transition-all text-left flex items-center gap-4 hover:shadow-lg"
                            >
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-black group-hover:text-white transition-colors">👤</div>
                                <div>
                                    <h3 className="font-bold text-lg text-black">Клиент</h3>
                                    <p className="text-xs text-gray-400">Заказываю для себя или компании</p>
                                </div>
                            </button>

                            <button
                                onClick={() => selectRole('dealer')}
                                className="group relative w-full p-6 border-2 border-gray-100 hover:border-blue-600 rounded-[16px] transition-all text-left flex items-center gap-4 hover:shadow-lg"
                            >
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">💼</div>
                                <div>
                                    <h3 className="font-bold text-lg text-black group-hover:text-blue-600">Дилер</h3>
                                    <p className="text-xs text-gray-400">Рекламное агентство / Типография</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}