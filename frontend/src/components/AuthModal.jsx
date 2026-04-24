import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { loginUser, registerUser, updateUserRole } from '../api';
import apiClient from '../api';

export const AuthModal = ({ onClose, onRoleCreated }) => {
    const [step, setStep] = useState(1);
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [pendingRole, setPendingRole] = useState(null);
    const [googleUser, setGoogleUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isRegistering) {
                if (password.length < 8) {
                    setError('Пароль должен быть не менее 8 символов.');
                    setLoading(false);
                    return;
                }
                if (!/\d/.test(password)) {
                    setError('Пароль должен содержать хотя бы одну цифру.');
                    setLoading(false);
                    return;
                }
                if (!/[a-zA-Z]/.test(password)) {
                    setError('Пароль должен содержать буквы.');
                    setLoading(false);
                    return;
                }
                setStep(2);
                setLoading(false);
            } else {
                const user = await loginUser(email, password);
                onRoleCreated?.(user, user.role, user.sub_role || null);
                onClose();
            }
        } catch (err) {
            const msg = err.response?.data?.detail;
            setError(msg === 'Неверный Email или пароль' ? msg : 'Произошла ошибка. Попробуйте снова.');
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError(null);
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseToken = await result.user.getIdToken();
            const { data } = await apiClient.post('/auth/google', { firebase_token: firebaseToken });
            localStorage.setItem('token', data.access_token);

            if (data.needs_role_setup) {
                setGoogleUser(data.user);
                setLoading(false);
                setStep(2);
            } else {
                onRoleCreated?.(data.user, data.user.role, data.user.sub_role || null);
                onClose();
            }
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('Ошибка входа через Google. Попробуйте снова.');
            }
            setLoading(false);
        }
    };

    const selectRole = (role) => {
        if (role === 'dealer') {
            finishRegistration(role, null);
        } else {
            setPendingRole(role);
            setStep(3);
        }
    };

    const selectSubRole = (subRole) => {
        finishRegistration(pendingRole || 'client', subRole);
    };

    const finishRegistration = async (role, subRole) => {
        setLoading(true);
        try {
            let user;
            if (googleUser) {
                user = await updateUserRole(role, subRole);
            } else {
                user = await registerUser(email, password, displayName, role, subRole);
            }
            onRoleCreated?.(user, user.role, user.sub_role || null);
            onClose();
        } catch (err) {
            const detail = err.response?.data?.detail;
            const msg = Array.isArray(detail)
                ? detail.map(d => d.msg?.replace(/^Value error, /, '')).join(' ')
                : detail;
            if (msg === 'Email уже зарегистрирован') setError('Этот Email уже зарегистрирован.');
            else if (msg) setError(msg);
            else setError('Ошибка при регистрации. Попробуйте снова.');
            setStep(1);
            setGoogleUser(null);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0F19]/80 backdrop-blur-xl p-4 font-sans text-white">

            <button
                onClick={onClose}
                className="absolute top-6 left-6 flex items-center gap-2 px-5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors rounded-full backdrop-blur-md text-sm font-bold text-gray-300"
            >
                <span>←</span> Назад
            </button>

            <div className="bg-[#1A1F2E]/60 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-md p-8 md:p-10 relative animate-fade-in overflow-hidden">

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-white/5 blur-[50px] rounded-full pointer-events-none"></div>

                {step === 1 ? (
                    <div className="relative z-10 flex flex-col items-center">

                        <div className="w-14 h-14 bg-white rounded-[16px] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1F2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                            {isRegistering ? 'Создать аккаунт' : 'С возвращением'}
                        </h2>
                        <p className="text-gray-400 text-sm mb-8 text-center">
                            {isRegistering ? 'Зарегистрируйся, чтобы сохранять макеты' : 'Войди, чтобы сохранить макет ежедневника'}
                        </p>

                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

                            {isRegistering && (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    </div>
                                    <input
                                        type="text" placeholder="Ваше имя" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full py-4 pl-12 pr-4 bg-black/20 border border-white/10 rounded-[16px] text-white text-sm focus:outline-none focus:border-white/30 focus:bg-black/40 transition-all placeholder:text-gray-500"
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                </div>
                                <input
                                    type="email" placeholder="email@example.com" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full py-4 pl-12 pr-4 bg-black/20 border border-white/10 rounded-[16px] text-white text-sm focus:outline-none focus:border-white/30 focus:bg-black/40 transition-all placeholder:text-gray-500"
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </div>
                                <input
                                    type="password" placeholder="Пароль" required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full py-4 pl-12 pr-4 bg-black/20 border border-white/10 rounded-[16px] text-white text-sm focus:outline-none focus:border-white/30 focus:bg-black/40 transition-all placeholder:text-gray-500"
                                />
                            </div>
                            {isRegistering && (
                                <p className="text-[11px] text-gray-500 -mt-2 pl-1">Минимум 8 символов, буквы и хотя бы одна цифра</p>
                            )}

                            {error && <p className="text-rose-400 text-xs font-bold text-center mt-1">{error}</p>}

                            <button
                                type="submit" disabled={loading}
                                className={`w-full py-4 mt-2 bg-gradient-to-b from-white to-gray-200 text-black rounded-[16px] font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Загрузка...' : (isRegistering ? 'Продолжить' : 'Войти')}
                            </button>
                        </form>

                        <div className="flex items-center gap-4 w-full my-6">
                            <div className="h-[1px] bg-white/10 flex-1"></div>
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest">или</span>
                            <div className="h-[1px] bg-white/10 flex-1"></div>
                        </div>

                        <button
                            onClick={handleGoogle}
                            disabled={loading}
                            className="w-full py-3 bg-black/20 border border-white/10 rounded-[16px] font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/5 transition-all text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Войти через Google
                        </button>

                        <div className="mt-6 text-center">
                            <button onClick={() => { setIsRegistering(!isRegistering); setError(null); }} className="text-[11px] text-gray-400 hover:text-white transition-colors">
                                {isRegistering ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
                                <span className="font-bold text-white">{isRegistering ? 'Войти' : 'Зарегистрироваться'}</span>
                            </button>
                        </div>
                    </div>

                ) : step === 2 ? (
                    <div className="relative z-10 flex flex-col items-center animate-fade-in text-center">
                        <div className="w-14 h-14 bg-white/10 rounded-[16px] flex items-center justify-center mb-6 border border-white/20">
                            <span className="text-2xl">👤</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Кто вы?</h2>
                        <p className="text-gray-400 text-sm mb-8">Выберите тип аккаунта для завершения регистрации</p>
                        <div className="flex flex-col gap-4 w-full">
                            <button onClick={() => selectRole('client')} disabled={loading} className="group w-full p-4 bg-black/20 border border-white/10 hover:border-emerald-400/50 rounded-[16px] transition-all text-left flex items-center gap-4 hover:bg-emerald-400/10 active:scale-95">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl border border-white/10 group-hover:border-emerald-400/50 transition-colors">🏢</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">Клиент</h3>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Для себя или компании</p>
                                </div>
                            </button>
                            <button onClick={() => selectRole('dealer')} disabled={loading} className="group w-full p-4 bg-black/20 border border-white/10 hover:border-blue-400/50 rounded-[16px] transition-all text-left flex items-center gap-4 hover:bg-blue-400/10 active:scale-95">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl border border-white/10 group-hover:border-blue-400/50 transition-colors">💼</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">Дилер</h3>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Типография / Агентство</p>
                                </div>
                            </button>
                        </div>
                    </div>

                ) : (
                    <div className="relative z-10 flex flex-col items-center animate-fade-in text-center">
                        <div className="w-14 h-14 bg-white/10 rounded-[16px] flex items-center justify-center mb-6 border border-white/20">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Как будете заказывать?</h2>
                        <p className="text-gray-400 text-sm mb-8">Это поможет нам подобрать лучшие условия</p>
                        <div className="flex flex-col gap-4 w-full">
                            <button onClick={() => selectSubRole('PL')} disabled={loading} className="group w-full p-4 bg-black/20 border border-white/10 hover:border-emerald-400/50 rounded-[16px] transition-all text-left flex items-center gap-4 hover:bg-emerald-400/10 active:scale-95">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl border border-white/10 group-hover:border-emerald-400/50 transition-colors">👤</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">Физическое лицо</h3>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Заказ для себя</p>
                                </div>
                            </button>
                            <button onClick={() => selectSubRole('КПР')} disabled={loading} className="group w-full p-4 bg-black/20 border border-white/10 hover:border-yellow-400/50 rounded-[16px] transition-all text-left flex items-center gap-4 hover:bg-yellow-400/10 active:scale-95">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl border border-white/10 group-hover:border-yellow-400/50 transition-colors">🏛️</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-white group-hover:text-yellow-400 transition-colors">Представитель компании</h3>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Корпоративный заказ</p>
                                </div>
                            </button>
                            <button onClick={() => selectSubRole('КЛ')} disabled={loading} className="group w-full p-4 bg-black/20 border border-white/10 hover:border-purple-400/50 rounded-[16px] transition-all text-left flex items-center gap-4 hover:bg-purple-400/10 active:scale-95">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl border border-white/10 group-hover:border-purple-400/50 transition-colors">🤝</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors">Корпоративный клиент</h3>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Постоянные оптовые заказы</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
