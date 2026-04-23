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
        <div className="min-h-screen w-full flex flex-col font-sans overflow-x-hidden transition-colors duration-500
            bg-[#F5F5F7] text-[#1D1D1F]
            dark:bg-[#0B0F19] dark:text-white">

            {/* Background depth gradient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0
                    bg-[radial-gradient(ellipse_100%_60%_at_50%_-5%,rgba(91,155,255,0.05),transparent)]
                    dark:bg-[radial-gradient(ellipse_100%_60%_at_50%_-5%,rgba(91,155,255,0.1),transparent)]" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3
                    bg-gradient-to-t from-[#F5F5F7] to-transparent
                    dark:from-[#0B0F19] dark:to-transparent" />
            </div>

            {/* HEADER */}
            <header className="w-full px-6 md:px-10 py-5 flex items-center justify-between z-50 relative">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all
                        bg-[#1D1D1F] border-transparent
                        dark:bg-white/[0.08] dark:border-white/[0.12] dark:backdrop-blur-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            className="text-white dark:text-white/80">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <span className="font-semibold text-base tracking-tight text-[#1D1D1F] dark:text-white">Spruzhyk</span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button onClick={cycleLanguage}
                        className="h-8 px-3.5 font-mono text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all
                            border-black/[0.08] text-[#1D1D1F]/50 bg-white/70 hover:bg-white hover:text-[#1D1D1F] backdrop-blur-sm
                            dark:border-white/[0.1] dark:text-white/40 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] dark:hover:text-white/80">
                        {language}
                    </button>
                    <button onClick={toggleTheme}
                        className="w-8 h-8 flex items-center justify-center rounded-full border transition-all
                            border-black/[0.08] text-[#1D1D1F]/50 bg-white/70 hover:bg-white backdrop-blur-sm
                            dark:border-white/[0.1] dark:text-white/40 dark:bg-white/[0.05] dark:hover:bg-white/[0.1]">
                        {theme === 'light'
                            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>}
                    </button>
                    {user ? (
                        <div className="flex items-center gap-3 h-8 px-4 rounded-full border text-xs transition-all
                            border-black/[0.08] bg-white/70 backdrop-blur-sm
                            dark:border-white/[0.1] dark:bg-white/[0.05]">
                            <span className="font-semibold text-[#1D1D1F] dark:text-white/85">{user.display_name || user.email.split('@')[0]}</span>
                            <span className="w-px h-3 bg-black/15 dark:bg-white/15" />
                            <button onClick={logout} className="font-semibold text-red-500/70 hover:text-red-500 dark:text-red-400/60 dark:hover:text-red-400 transition-colors">
                                {t(language, 'logout')}
                            </button>
                        </div>
                    ) : (
                        <button onClick={onAuth}
                            className="h-8 px-5 text-xs font-semibold rounded-full transition-all
                                bg-[#1D1D1F] text-white hover:bg-black/80 active:scale-[0.97]
                                dark:bg-white dark:text-[#0B0F19] dark:hover:bg-white/90">
                            {t(language, 'login')}
                        </button>
                    )}
                </div>
            </header>

            {/* HERO */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 pb-20 pt-6 z-10 relative">

                {/* Status badge */}
                <div className="flex items-center gap-2 mb-8 animate-fade-in">
                    <div className="flex items-center gap-2 h-7 px-3.5 rounded-full border text-[10px] font-mono uppercase tracking-widest transition-all
                        border-black/[0.07] bg-white/60 text-[#1D1D1F]/40 backdrop-blur-sm
                        dark:border-white/[0.09] dark:bg-white/[0.04] dark:text-white/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-90" />
                        {t(language, 'constructor')} · 2026
                    </div>
                </div>

                {/* Headline — Tesla scale, Apple precision */}
                <h1 className="text-5xl md:text-[6.5rem] font-bold text-center leading-[1.04] tracking-[-0.03em] mb-5 animate-fade-up"
                    style={{ animationDelay: '0.1s', opacity: 0 }}>
                    <span className="text-[#1D1D1F] dark:text-white">{t(language, 'title1')}</span>
                    <br />
                    <span className="text-[#1D1D1F]/60
                        dark:bg-gradient-to-br dark:from-white dark:via-blue-100 dark:to-[#5B9BFF]/70
                        dark:bg-clip-text dark:text-transparent">
                        {t(language, 'title2')}
                    </span>
                </h1>

                <p className="text-sm md:text-[15px] text-center max-w-md mb-14 leading-relaxed animate-fade-up
                    text-[#1D1D1F]/45 dark:text-white/35"
                    style={{ animationDelay: '0.2s', opacity: 0 }}>
                    {t(language, 'subtitle')}
                </p>

                {/* Product card — Liquid Glass */}
                <div className="w-full max-w-4xl animate-fade-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                    <div
                        onClick={() => handleSelect('notebook', { format: 'A5', bindingType: 'hard', hasElastic: true })}
                        className="group relative cursor-pointer rounded-[28px] overflow-hidden transition-all duration-700 md:flex md:items-stretch
                            bg-white/80 border border-black/[0.06] shadow-[0_4px_40px_rgba(0,0,0,0.07),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_12px_60px_rgba(0,0,0,0.13)]
                            dark:bg-white/[0.05] dark:border-white/[0.08] dark:backdrop-blur-2xl dark:hover:bg-white/[0.08]
                            dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.05)_inset,_0_20px_60px_rgba(0,0,0,0.5)]
                            dark:hover:shadow-[0_0_0_0.5px_rgba(255,255,255,0.1)_inset,_0_28px_80px_rgba(0,0,0,0.6)]">

                        {/* Specular top edge */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20 pointer-events-none z-10" />

                        {/* Left — illustration */}
                        <div className="relative md:w-[42%] h-60 md:h-[280px] flex items-center justify-center overflow-hidden
                            bg-[#EBEBED] dark:bg-[#080C18]">
                            <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.06]"
                                style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-blue-500/5 dark:to-transparent" />

                            <svg width="110" height="148" viewBox="0 0 100 130" fill="none"
                                className="relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] group-hover:scale-[1.04] group-hover:-translate-y-1 transition-all duration-700">
                                <rect x="20" y="10" width="62" height="110" rx="3" fill="#1D1D1F"/>
                                <path d="M78 12 V118 L84 116 V14 Z" fill="#5B9BFF" opacity="0.9"/>
                                <rect x="20" y="10" width="9" height="110" fill="black" fillOpacity="0.3" />
                                <rect x="30" y="28" width="38" height="1.5" rx="0.75" fill="white" fillOpacity="0.18"/>
                                <rect x="30" y="36" width="28" height="1" rx="0.5" fill="white" fillOpacity="0.1"/>
                                <rect x="30" y="44" width="34" height="1" rx="0.5" fill="white" fillOpacity="0.07"/>
                            </svg>

                            <div className="absolute top-4 left-4">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-[#1D1D1F]/35 dark:text-white/25">А5 · Твёрдый</span>
                            </div>
                        </div>

                        {/* Right — text */}
                        <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#1D1D1F]/30 dark:text-white/25 mb-2">01 — Ежедневник</p>
                                        <h3 className="text-3xl md:text-[2.5rem] font-bold tracking-tight leading-none text-[#1D1D1F] dark:text-white">
                                            {t(language, 'notebook')}
                                        </h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-all duration-300
                                        border-black/10 text-[#1D1D1F]/40
                                        group-hover:bg-[#1D1D1F] group-hover:border-[#1D1D1F] group-hover:text-white
                                        dark:border-white/[0.1] dark:text-white/30
                                        dark:group-hover:bg-white dark:group-hover:border-white dark:group-hover:text-[#0B0F19]">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </div>
                                </div>
                                <p className="text-sm text-[#1D1D1F]/45 dark:text-white/35 leading-relaxed max-w-sm">
                                    {t(language, 'notebookDesc')}
                                </p>
                            </div>

                            <div className="flex items-center gap-5 pt-6 border-t border-black/[0.05] dark:border-white/[0.06] mt-6">
                                {['A5', 'A6', 'B6'].map(fmt => (
                                    <span key={fmt} className="font-mono text-[10px] uppercase tracking-widest text-[#1D1D1F]/30 dark:text-white/20">{fmt}</span>
                                ))}
                                <span className="font-mono text-[10px] text-[#1D1D1F]/15 dark:text-white/10">·</span>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-[#1D1D1F]/30 dark:text-white/20">Твёрдый / Пружина</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="relative z-10 pb-8 text-center">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#1D1D1F]/20 dark:text-white/15">
                    By Spoogeek · {new Date().getFullYear()}
                </span>
            </footer>
        </div>
    );
};
