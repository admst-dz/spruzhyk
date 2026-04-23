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
        if (role === 'dealer') { finishRegistration(role, null); }
        else { setPendingRole(role); setStep(3); }
    };

    const selectSubRole = (subRole) => finishRegistration(pendingRole || 'client', subRole);

    const finishRegistration = async (role, subRole) => {
        setLoading(true);
        try {
            let user;
            if (googleUser) { user = await updateUserRole(role, subRole); }
            else { user = await registerUser(email, password, displayName, role, subRole); }
            onRoleCreated?.(user, user.role, user.sub_role || null);
            onClose();
        } catch (err) {
            const msg = err.response?.data?.detail;
            if (msg === 'Email уже зарегистрирован') setError('Этот Email уже зарегистрирован.');
            else setError('Ошибка при регистрации. Попробуйте снова.');
            setStep(1); setGoogleUser(null); setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans
            bg-black/40 dark:bg-[#0B0F19]/70 backdrop-blur-xl">

            <button onClick={onClose}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all
                    border-black/[0.08] bg-white/80 text-[#1D1D1F]/60 hover:bg-white hover:text-[#1D1D1F] backdrop-blur-sm
                    dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-white/40 dark:hover:bg-white/[0.12] dark:hover:text-white/80">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Назад
            </button>

            {/* Liquid Glass modal */}
            <div className="relative w-full max-w-[400px] rounded-[28px] overflow-hidden border animate-fade-in
                bg-white/85 border-black/[0.06] backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.12),0_1px_0_rgba(255,255,255,0.9)_inset]
                dark:bg-[#0F1525]/80 dark:border-white/[0.08] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.07)_inset,_0_32px_80px_rgba(0,0,0,0.6)]">

                {/* Specular edge */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/20 pointer-events-none z-10" />

                <div className="p-8 md:p-10">
                    {step === 1 ? (
                        <div className="flex flex-col items-center">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-6 border transition-all
                                bg-[#1D1D1F] border-transparent
                                dark:bg-white/[0.08] dark:border-white/[0.12]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    className="text-white dark:text-white/80">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-1">
                                {isRegistering ? 'Создать аккаунт' : 'С возвращением'}
                            </h2>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-[#1D1D1F]/35 dark:text-white/30 mb-7 text-center">
                                {isRegistering ? 'Зарегистрируйтесь, чтобы сохранять макеты' : 'Войдите, чтобы сохранить макет'}
                            </p>

                            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                                {isRegistering && (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                                className="text-[#1D1D1F]/30 dark:text-white/25"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                        </div>
                                        <input type="text" placeholder="Ваше имя" value={displayName} onChange={e => setDisplayName(e.target.value)}
                                            className="w-full py-3 pl-10 pr-4 rounded-xl border text-sm outline-none transition-all
                                                bg-black/[0.03] border-black/[0.08] text-[#1D1D1F] placeholder:text-[#1D1D1F]/30
                                                focus:border-black/20 focus:bg-black/[0.05]
                                                dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/25
                                                dark:focus:border-white/20 dark:focus:bg-white/[0.09]" />
                                    </div>
                                )}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                            className="text-[#1D1D1F]/30 dark:text-white/25"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    </div>
                                    <input type="email" placeholder="email@example.com" required value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full py-3 pl-10 pr-4 rounded-xl border text-sm outline-none transition-all
                                            bg-black/[0.03] border-black/[0.08] text-[#1D1D1F] placeholder:text-[#1D1D1F]/30
                                            focus:border-black/20 focus:bg-black/[0.05]
                                            dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/25
                                            dark:focus:border-white/20 dark:focus:bg-white/[0.09]" />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                            className="text-[#1D1D1F]/30 dark:text-white/25"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    </div>
                                    <input type="password" placeholder="Пароль" required value={password} onChange={e => setPassword(e.target.value)}
                                        className="w-full py-3 pl-10 pr-4 rounded-xl border text-sm outline-none transition-all
                                            bg-black/[0.03] border-black/[0.08] text-[#1D1D1F] placeholder:text-[#1D1D1F]/30
                                            focus:border-black/20 focus:bg-black/[0.05]
                                            dark:bg-white/[0.05] dark:border-white/[0.08] dark:text-white dark:placeholder:text-white/25
                                            dark:focus:border-white/20 dark:focus:bg-white/[0.09]" />
                                </div>

                                {error && <p className="font-mono text-[10px] uppercase tracking-wider text-red-500 dark:text-red-400 text-center">{error}</p>}

                                <button type="submit" disabled={loading}
                                    className={`w-full py-3 mt-1 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]
                                        bg-[#1D1D1F] text-white hover:bg-black/85
                                        dark:bg-white dark:text-[#0B0F19] dark:hover:bg-white/92
                                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {loading ? 'Загрузка...' : (isRegistering ? 'Продолжить' : 'Войти')}
                                </button>
                            </form>

                            <div className="flex items-center gap-3 w-full my-5">
                                <div className="h-px flex-1 bg-black/[0.07] dark:bg-white/[0.07]" />
                                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#1D1D1F]/25 dark:text-white/20">или</span>
                                <div className="h-px flex-1 bg-black/[0.07] dark:bg-white/[0.07]" />
                            </div>

                            <button onClick={handleGoogle} disabled={loading}
                                className="w-full py-2.5 rounded-xl border font-medium text-sm flex items-center justify-center gap-3 transition-all
                                    border-black/[0.08] bg-black/[0.03] text-[#1D1D1F]/80 hover:bg-black/[0.06]
                                    dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white/75 dark:hover:bg-white/[0.09]
                                    disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
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
                                    className="font-mono text-[10px] uppercase tracking-wider text-[#1D1D1F]/35 dark:text-white/30 hover:text-[#1D1D1F]/70 dark:hover:text-white/60 transition-colors">
                                    {isRegistering ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
                                    <span className="font-bold text-[#1D1D1F]/70 dark:text-white/70">{isRegistering ? 'Войти' : 'Зарегистрироваться'}</span>
                                </button>
                            </div>
                        </div>

                    ) : step === 2 ? (
                        <div className="flex flex-col items-center animate-fade-in text-center">
                            <div className="w-11 h-11 rounded-2xl border flex items-center justify-center mb-6
                                bg-black/[0.04] border-black/[0.07] dark:bg-white/[0.07] dark:border-white/[0.1]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    className="text-[#1D1D1F]/60 dark:text-white/60"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-1">Кто вы?</h2>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-[#1D1D1F]/35 dark:text-white/30 mb-7">
                                Выберите тип аккаунта
                            </p>
                            <div className="flex flex-col gap-2.5 w-full">
                                {[
                                    { role: 'client', label: 'Клиент', desc: 'Для себя или компании' },
                                    { role: 'dealer', label: 'Дилер', desc: 'Типография / Агентство' },
                                ].map(({ role, label, desc }) => (
                                    <button key={role} onClick={() => selectRole(role)} disabled={loading}
                                        className="group w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all active:scale-[0.98]
                                            border-black/[0.07] bg-black/[0.02] hover:bg-black/[0.05] hover:border-black/[0.12]
                                            dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.07] dark:hover:border-white/[0.15]
                                            disabled:opacity-50">
                                        <div className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0
                                            bg-black/[0.04] border-black/[0.07] dark:bg-white/[0.06] dark:border-white/[0.1]">
                                            {role === 'client'
                                                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1D1D1F]/50 dark:text-white/50"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1D1D1F]/50 dark:text-white/50"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-[#1D1D1F] dark:text-white/90">{label}</p>
                                            <p className="font-mono text-[9px] uppercase tracking-wider text-[#1D1D1F]/35 dark:text-white/25 mt-0.5">{desc}</p>
                                        </div>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1D1D1F]/25 dark:text-white/20 shrink-0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </button>
                                ))}
                            </div>
                        </div>

                    ) : (
                        <div className="flex flex-col items-center animate-fade-in text-center">
                            <div className="w-11 h-11 rounded-2xl border flex items-center justify-center mb-6
                                bg-black/[0.04] border-black/[0.07] dark:bg-white/[0.07] dark:border-white/[0.1]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    className="text-[#1D1D1F]/60 dark:text-white/60"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white mb-1">Как будете заказывать?</h2>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-[#1D1D1F]/35 dark:text-white/30 mb-7">
                                Это поможет подобрать условия
                            </p>
                            <div className="flex flex-col gap-2.5 w-full">
                                {[
                                    { code: 'PL', label: 'Физическое лицо', desc: 'Заказ для себя' },
                                    { code: 'КПР', label: 'Представитель компании', desc: 'Корпоративный заказ' },
                                    { code: 'КЛ', label: 'Корпоративный клиент', desc: 'Постоянные оптовые заказы' },
                                ].map(({ code, label, desc }) => (
                                    <button key={code} onClick={() => selectSubRole(code)} disabled={loading}
                                        className="w-full p-4 rounded-2xl border text-left flex items-center gap-3 transition-all active:scale-[0.98]
                                            border-black/[0.07] bg-black/[0.02] hover:bg-black/[0.05]
                                            dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.07] disabled:opacity-50">
                                        <div className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0
                                            bg-black/[0.04] border-black/[0.07] dark:bg-white/[0.06] dark:border-white/[0.1]">
                                            <span className="font-mono text-[8px] font-bold text-[#1D1D1F]/40 dark:text-white/35">{code.slice(0,2)}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-[#1D1D1F] dark:text-white/90">{label}</p>
                                            <p className="font-mono text-[9px] uppercase tracking-wider text-[#1D1D1F]/35 dark:text-white/25 mt-0.5">{desc}</p>
                                        </div>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1D1D1F]/25 dark:text-white/20 shrink-0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
