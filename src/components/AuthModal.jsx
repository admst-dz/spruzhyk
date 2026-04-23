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
            const msg = err.response?.data?.detail;
            if (msg === 'Email уже зарегистрирован') setError('Этот Email уже зарегистрирован.');
            else setError('Ошибка при регистрации. Попробуйте снова.');
            setStep(1);
            setGoogleUser(null);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center
            bg-ink-900/60 dark:bg-[#0C0B09]/80
            backdrop-blur-xl p-4 font-sans">

            <button
                onClick={onClose}
                className="absolute top-6 left-6 flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm font-bold
                    border-paper-300 text-ink-700 bg-paper-50/90 hover:bg-paper-100
                    dark:border-white/10 dark:text-white/50 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Назад
            </button>

            <div className="relative w-full max-w-md rounded-3xl overflow-hidden border shadow-2xl animate-fade-in
                bg-paper-50 border-paper-200 shadow-ink-900/10
                dark:bg-[#13110E] dark:border-white/[0.07] dark:shadow-black/60">

                {/* Decorative top gradient */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-paper-400/60 to-transparent dark:via-[#C9A96E]/20" />
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full blur-[60px]
                    bg-paper-300/40 dark:bg-[#C9A96E]/[0.05]" />

                <div className="relative z-10 p-8 md:p-10">
                    {step === 1 ? (
                        <div className="flex flex-col items-center">

                            <div className="w-12 h-12 border rounded-2xl flex items-center justify-center mb-6
                                border-paper-300 bg-paper-100
                                dark:border-[#C9A96E]/30 dark:bg-[#C9A96E]/5">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    className="text-paper-500 dark:text-[#C9A96E]">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                                </svg>
                            </div>

                            <h2 className="font-display text-3xl font-300 text-ink-900 dark:text-[#F0EBE1] mb-1">
                                {isRegistering ? 'Создать аккаунт' : 'С возвращением'}
                            </h2>
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-400 dark:text-white/30 mb-8 text-center">
                                {isRegistering ? 'Зарегистрируйтесь, чтобы сохранять макеты' : 'Войдите, чтобы сохранить макет ежедневника'}
                            </p>

                            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">

                                {isRegistering && (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                                className="text-paper-400 dark:text-white/25"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        </div>
                                        <input
                                            type="text" placeholder="Ваше имя" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full py-3.5 pl-11 pr-4 rounded-2xl border text-sm transition-all outline-none
                                                bg-paper-100 border-paper-200 text-ink-900 placeholder:text-paper-400
                                                focus:border-paper-400 focus:bg-white
                                                dark:bg-white/[0.04] dark:border-white/8 dark:text-[#F0EBE1] dark:placeholder:text-white/20
                                                dark:focus:border-white/20 dark:focus:bg-white/[0.07]"
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                            className="text-paper-400 dark:text-white/25"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    </div>
                                    <input
                                        type="email" placeholder="email@example.com" required value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full py-3.5 pl-11 pr-4 rounded-2xl border text-sm transition-all outline-none
                                            bg-paper-100 border-paper-200 text-ink-900 placeholder:text-paper-400
                                            focus:border-paper-400 focus:bg-white
                                            dark:bg-white/[0.04] dark:border-white/8 dark:text-[#F0EBE1] dark:placeholder:text-white/20
                                            dark:focus:border-white/20 dark:focus:bg-white/[0.07]"
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                            className="text-paper-400 dark:text-white/25"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    </div>
                                    <input
                                        type="password" placeholder="Пароль" required value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full py-3.5 pl-11 pr-4 rounded-2xl border text-sm transition-all outline-none
                                            bg-paper-100 border-paper-200 text-ink-900 placeholder:text-paper-400
                                            focus:border-paper-400 focus:bg-white
                                            dark:bg-white/[0.04] dark:border-white/8 dark:text-[#F0EBE1] dark:placeholder:text-white/20
                                            dark:focus:border-white/20 dark:focus:bg-white/[0.07]"
                                    />
                                </div>

                                {error && (
                                    <p className="font-mono text-[10px] uppercase tracking-wider text-red-500 dark:text-red-400/80 text-center">{error}</p>
                                )}

                                <button
                                    type="submit" disabled={loading}
                                    className={`w-full py-3.5 mt-1 rounded-2xl font-bold text-sm transition-all
                                        bg-ink-900 text-white hover:bg-ink-800 active:scale-[0.98]
                                        dark:bg-transparent dark:border dark:border-[#C9A96E]/50 dark:text-[#C9A96E] dark:hover:bg-[#C9A96E]/10
                                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Загрузка...' : (isRegistering ? 'Продолжить' : 'Войти')}
                                </button>
                            </form>

                            <div className="flex items-center gap-4 w-full my-5">
                                <div className="h-px flex-1 bg-paper-200 dark:bg-white/8" />
                                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-paper-400 dark:text-white/20">или</span>
                                <div className="h-px flex-1 bg-paper-200 dark:bg-white/8" />
                            </div>

                            <button
                                onClick={handleGoogle}
                                disabled={loading}
                                className="w-full py-3 rounded-2xl border font-bold text-sm flex items-center justify-center gap-3 transition-all
                                    border-paper-200 bg-paper-100 text-ink-800 hover:bg-paper-200
                                    dark:border-white/8 dark:bg-white/[0.03] dark:text-white/70 dark:hover:bg-white/[0.07]
                                    disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Войти через Google
                            </button>

                            <div className="mt-5 text-center">
                                <button onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                                    className="font-mono text-[10px] uppercase tracking-wider text-paper-400 dark:text-white/30 hover:text-ink-700 dark:hover:text-white/60 transition-colors">
                                    {isRegistering ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
                                    <span className="text-ink-800 dark:text-white/70 font-bold">{isRegistering ? 'Войти' : 'Зарегистрироваться'}</span>
                                </button>
                            </div>
                        </div>

                    ) : step === 2 ? (
                        <div className="flex flex-col items-center animate-fade-in text-center">
                            <div className="w-12 h-12 border rounded-2xl flex items-center justify-center mb-6
                                border-paper-300 bg-paper-100 dark:border-white/10 dark:bg-white/[0.04]">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    className="text-ink-700 dark:text-white/60"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <h2 className="font-display text-3xl font-300 text-ink-900 dark:text-[#F0EBE1] mb-1">Кто вы?</h2>
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-400 dark:text-white/30 mb-8">
                                Выберите тип аккаунта для завершения регистрации
                            </p>
                            <div className="flex flex-col gap-3 w-full">
                                <button onClick={() => selectRole('client')} disabled={loading}
                                    className="group w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all
                                        border-paper-200 bg-paper-100 hover:bg-paper-200 hover:border-paper-400
                                        dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.07]
                                        active:scale-[0.98] disabled:opacity-50">
                                    <div className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0
                                        border-paper-300 bg-white dark:border-white/10 dark:bg-white/[0.05]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                            className="text-ink-700 dark:text-white/50"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-bold text-sm text-ink-900 dark:text-white/90">Клиент</h3>
                                        <p className="font-mono text-[9px] uppercase tracking-wider text-paper-400 dark:text-white/25 mt-0.5">Для себя или компании</p>
                                    </div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        className="text-paper-400 dark:text-white/20 shrink-0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </button>
                                <button onClick={() => selectRole('dealer')} disabled={loading}
                                    className="group w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all
                                        border-paper-200 bg-paper-100 hover:bg-paper-200 hover:border-paper-400
                                        dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.07]
                                        active:scale-[0.98] disabled:opacity-50">
                                    <div className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0
                                        border-paper-300 bg-white dark:border-white/10 dark:bg-white/[0.05]">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                            className="text-ink-700 dark:text-white/50"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className="font-bold text-sm text-ink-900 dark:text-white/90">Дилер</h3>
                                        <p className="font-mono text-[9px] uppercase tracking-wider text-paper-400 dark:text-white/25 mt-0.5">Типография / Агентство</p>
                                    </div>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        className="text-paper-400 dark:text-white/20 shrink-0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </button>
                            </div>
                        </div>

                    ) : (
                        <div className="flex flex-col items-center animate-fade-in text-center">
                            <div className="w-12 h-12 border rounded-2xl flex items-center justify-center mb-6
                                border-paper-300 bg-paper-100 dark:border-white/10 dark:bg-white/[0.04]">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    className="text-ink-700 dark:text-white/60"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            </div>
                            <h2 className="font-display text-3xl font-300 text-ink-900 dark:text-[#F0EBE1] mb-1">Как будете заказывать?</h2>
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-400 dark:text-white/30 mb-8">
                                Это поможет нам подобрать лучшие условия
                            </p>
                            <div className="flex flex-col gap-3 w-full">
                                {[
                                    { code: 'PL', label: 'Физическое лицо', desc: 'Заказ для себя' },
                                    { code: 'КПР', label: 'Представитель компании', desc: 'Корпоративный заказ' },
                                    { code: 'КЛ', label: 'Корпоративный клиент', desc: 'Постоянные оптовые заказы' },
                                ].map(({ code, label, desc }) => (
                                    <button key={code} onClick={() => selectSubRole(code)} disabled={loading}
                                        className="w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all
                                            border-paper-200 bg-paper-100 hover:bg-paper-200 hover:border-paper-400
                                            dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.07]
                                            active:scale-[0.98] disabled:opacity-50">
                                        <div className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0
                                            border-paper-300 bg-white dark:border-white/10 dark:bg-white/[0.05]">
                                            <span className="font-mono text-[9px] font-bold text-paper-500 dark:text-white/40">{code.slice(0, 2)}</span>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h3 className="font-bold text-sm text-ink-900 dark:text-white/90">{label}</h3>
                                            <p className="font-mono text-[9px] uppercase tracking-wider text-paper-400 dark:text-white/25 mt-0.5">{desc}</p>
                                        </div>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                            className="text-paper-400 dark:text-white/20 shrink-0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
