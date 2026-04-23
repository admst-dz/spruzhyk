import React, { useEffect } from 'react';
import { useConfigurator } from '../store';
import { t } from '../i18n';

export const Home = ({ onStart, onAuth, user, logout }) => {
    const {
        setProduct, setFormat, setBindingType, setHasElastic,
        language, setLanguage, theme, toggleTheme
    } = useConfigurator();

    useEffect(() => {
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [theme]);

    const handleSelect = (productType, config = {}) => {
        setProduct(productType);
        setFormat(config.format || 'A5');
        setBindingType(config.bindingType || 'hard');
        setHasElastic(config.hasElastic !== undefined ? config.hasElastic : true);
        onStart();
    };

    const cycleLanguage = () => {
        if (language === 'ru') setLanguage('en');
        else if (language === 'en') setLanguage('by');
        else setLanguage('ru');
    };

    return (
        <div className="min-h-screen w-full flex flex-col font-sans transition-colors duration-500 overflow-x-hidden
            bg-paper-100 text-ink-900
            dark:bg-[#0C0B09] dark:text-[#F0EBE1]">

            {/* Декоративные линии фона */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-[20%] w-px h-full bg-paper-300/40 dark:bg-white/[0.03]" />
                <div className="absolute top-0 left-[80%] w-px h-full bg-paper-300/40 dark:bg-white/[0.03]" />
                <div className="absolute top-[30%] left-0 w-full h-px bg-paper-300/40 dark:bg-white/[0.03]" />
                <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full
                    bg-paper-400/10 dark:bg-[#C9A96E]/[0.04] blur-[120px]" />
                <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full
                    bg-paper-300/20 dark:bg-[#4A3728]/30 blur-[100px]" />
            </div>

            {/* HEADER */}
            <header className="w-full px-6 md:px-10 py-5 flex items-center justify-between z-50 relative">
                {/* Логотип */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border border-paper-400 dark:border-[#C9A96E]/40 rounded-lg flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-paper-500 dark:text-[#C9A96E]">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <span className="font-display text-lg font-600 tracking-wide text-ink-900 dark:text-[#F0EBE1]">Spruzhyk</span>
                </div>

                {/* Правые контролы */}
                <div className="flex items-center gap-2">
                    <button onClick={cycleLanguage}
                        className="h-9 px-4 text-[10px] font-mono font-bold uppercase tracking-widest border rounded-full transition-all
                            border-paper-300 text-ink-700 hover:border-paper-500 hover:text-ink-900 bg-paper-50/80
                            dark:border-white/10 dark:text-white/40 dark:hover:border-white/30 dark:hover:text-white/80 dark:bg-white/[0.03]">
                        {language}
                    </button>
                    <button onClick={toggleTheme}
                        className="w-9 h-9 flex items-center justify-center rounded-full border transition-all
                            border-paper-300 text-ink-700 hover:border-paper-500 bg-paper-50/80
                            dark:border-white/10 dark:text-white/40 dark:hover:border-white/30 dark:bg-white/[0.03]">
                        {theme === 'light'
                            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>}
                    </button>
                    {user ? (
                        <div className="flex items-center gap-3 h-9 px-4 border rounded-full text-xs transition-all
                            border-paper-300 bg-paper-50/80
                            dark:border-white/10 dark:bg-white/[0.03]">
                            <span className="font-bold text-ink-800 dark:text-white/80">{user.display_name || user.email.split('@')[0]}</span>
                            <span className="w-px h-3 bg-paper-300 dark:bg-white/10" />
                            <button onClick={logout} className="text-red-400 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 font-bold transition-colors">
                                {t(language, 'logout')}
                            </button>
                        </div>
                    ) : (
                        <button onClick={onAuth}
                            className="h-9 px-5 text-xs font-bold rounded-full border transition-all
                                border-ink-900 bg-ink-900 text-white hover:bg-ink-800
                                dark:border-[#C9A96E]/50 dark:bg-transparent dark:text-[#C9A96E] dark:hover:bg-[#C9A96E]/10">
                            {t(language, 'login')}
                        </button>
                    )}
                </div>
            </header>

            {/* HERO */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 pb-20 pt-8 z-10 relative">

                {/* Бейдж */}
                <div className="flex items-center gap-2 mb-10 animate-fade-in">
                    <div className="w-1.5 h-1.5 rounded-full bg-paper-500 dark:bg-[#C9A96E] animate-pulse" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper-500 dark:text-[#C9A96E]/70">
                        {t(language, 'constructor')} — 2026
                    </span>
                </div>

                {/* Заголовок */}
                <h1 className="font-display text-5xl md:text-[7rem] font-300 text-center leading-[1.05] tracking-[-0.02em] mb-6 animate-fade-up"
                    style={{ animationDelay: '0.1s', opacity: 0 }}>
                    <span className="text-ink-900 dark:text-[#F0EBE1]">{t(language, 'title1')}</span>
                    <br/>
                    <span className="italic text-paper-500 dark:text-[#C9A96E]">{t(language, 'title2')}</span>
                </h1>

                <p className="font-sans text-paper-500 dark:text-[#F0EBE1]/40 text-sm md:text-base text-center max-w-lg mb-16 leading-relaxed animate-fade-up"
                    style={{ animationDelay: '0.2s', opacity: 0 }}>
                    {t(language, 'subtitle')}
                </p>

                {/* Карточки продуктов */}
                <div className="w-full max-w-5xl animate-fade-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                    <div
                        onClick={() => handleSelect('notebook', { format: 'A5', bindingType: 'hard', hasElastic: true })}
                        className="group relative mx-auto max-w-sm md:max-w-none cursor-pointer
                            rounded-3xl overflow-hidden border transition-all duration-700
                            border-paper-200 bg-white shadow-[0_2px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_60px_rgba(0,0,0,0.12)]
                            dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]
                            md:flex md:items-stretch">

                        {/* Левая часть — иллюстрация */}
                        <div className="relative md:w-2/5 h-64 md:h-80 flex items-center justify-center overflow-hidden
                            bg-paper-200/60 dark:bg-[#1A1714]">
                            {/* Декоративная сетка */}
                            <div className="absolute inset-0 opacity-20 dark:opacity-10"
                                style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                            <div className="absolute inset-0 bg-gradient-to-br from-paper-400/10 to-transparent dark:from-[#C9A96E]/5" />
                            <svg width="120" height="160" viewBox="0 0 100 130" fill="none"
                                className="relative z-10 drop-shadow-2xl group-hover:scale-[1.03] transition-transform duration-700">
                                <rect x="20" y="10" width="62" height="110" rx="3" fill="#1A1714" className="dark:fill-[#F0EBE1]"/>
                                <path d="M78 12 V118 L84 116 V14 Z" fill="#C9A96E" />
                                <rect x="20" y="10" width="9" height="110" fill="black" fillOpacity="0.35" />
                                <rect x="30" y="28" width="38" height="1.5" rx="0.75" fill="white" fillOpacity="0.2"/>
                                <rect x="30" y="36" width="28" height="1" rx="0.5" fill="white" fillOpacity="0.12"/>
                            </svg>
                            {/* Угловой лейбл */}
                            <div className="absolute top-4 left-4 flex items-center gap-1.5">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-paper-500 dark:text-[#C9A96E]/60">А5 · Твёрдый</span>
                            </div>
                        </div>

                        {/* Правая часть — текст */}
                        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper-400 dark:text-white/25 mb-2">01 — Ежедневник</p>
                                        <h3 className="font-display text-3xl md:text-4xl font-300 text-ink-900 dark:text-[#F0EBE1] leading-tight">
                                            {t(language, 'notebook')}
                                        </h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 mt-1
                                        border-paper-300 text-ink-700 group-hover:bg-ink-900 group-hover:border-ink-900 group-hover:text-white
                                        dark:border-white/10 dark:text-white/40 dark:group-hover:bg-[#C9A96E] dark:group-hover:border-[#C9A96E] dark:group-hover:text-ink-900
                                        transition-all duration-300">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </div>
                                </div>
                                <p className="text-sm text-paper-500 dark:text-white/35 leading-relaxed max-w-xs">
                                    {t(language, 'notebookDesc')}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 pt-8 border-t border-paper-200 dark:border-white/5 mt-8">
                                {['A5', 'A6', 'B6'].map(fmt => (
                                    <span key={fmt} className="font-mono text-[10px] uppercase tracking-widest text-paper-400 dark:text-white/20">{fmt}</span>
                                ))}
                                <span className="font-mono text-[10px] text-paper-300 dark:text-white/10">·</span>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-paper-400 dark:text-white/20">Твёрдый / Пружина</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="relative z-10 pb-8 text-center">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-paper-400 dark:text-white/15">
                    By Spoogeek · {new Date().getFullYear()}
                </span>
            </footer>
        </div>
    );
};
