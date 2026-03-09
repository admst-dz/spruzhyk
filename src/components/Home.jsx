import React from 'react';
import { useConfigurator } from '../store';

// Принимаем пропсы для авторизации
export const Home = ({ onStart, onAuth, user, logout }) => {
    const { setProduct } = useConfigurator();

    const handleSelect = (productType) => {
        setProduct(productType);
        onStart();
    };

    return (
        // Добавил relative для позиционирования кнопки
        <div className="relative min-h-screen w-full flex flex-col items-center py-10 font-zen bg-gradient-to-br from-[#EAF4FF] via-[#DEECFF] to-[#CDE2FF]">

            {/* === КНОПКА ВОЙТИ / ПРОФИЛЬ (В ПРАВОМ ВЕРХНЕМ УГЛУ) === */}
            <div className="absolute top-6 right-6 z-50">
                {user ? (
                    <div className="flex items-center gap-4 bg-white/80 backdrop-blur rounded-full px-5 py-2.5 shadow-sm border border-blue-100 animate-fade-in">
                        <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-black uppercase tracking-wider">
                          {user.displayName || user.email.split('@')[0]}
                      </span>
                        </div>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <button
                            onClick={logout}
                            className="text-xs text-red-500 font-bold hover:text-red-700 transition"
                        >
                            Выйти
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onAuth}
                        className="px-8 py-3 bg-white text-blue-600 border border-blue-200 rounded-full font-bold text-sm hover:bg-blue-50 hover:shadow-md transition shadow-sm font-zen flex items-center gap-2"
                    >
                        {/* Иконка юзера */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Войти
                    </button>
                )}
            </div>


            {/* Заголовок */}
            <div className="mt-10 mb-20 text-center">
                <h1 className="text-5xl md:text-6xl text-[#1a1a1a] font-normal tracking-wide relative inline-block pb-2">
                    Конструктор
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-black rounded-full"></span>
                </h1>
            </div>

            {/* Сетка выбора */}
            <div className="flex flex-col md:flex-row gap-16 md:gap-32 items-center justify-center w-full max-w-6xl px-6">

                {/* === БЛОК 1: ЕЖЕДНЕВНИК === */}
                <div
                    onClick={() => handleSelect('notebook')}
                    className="flex flex-col items-center gap-6 cursor-pointer group w-80"
                >
                    <div className="w-full text-center">
                        <h2 className="text-3xl text-gray-600 mb-2 group-hover:text-black transition-colors font-light">Ежедневник</h2>
                        <div className="w-full h-[1px] bg-gray-400 group-hover:bg-black transition-colors"></div>
                    </div>

                    <div className="w-full aspect-square bg-[#F4F7FB] rounded-[40px] shadow-lg flex items-center justify-center border border-white transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl overflow-hidden">
                        <img
                            src="/patterns/Notebook.svg"
                            alt="Ежедневник"
                            className="w-[70%] h-[70%] object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                </div>

                {/* === БЛОК 2: КАЛЕНДАРЬ === */}
                <div
                    onClick={() => handleSelect('calendar')}
                    className="flex flex-col items-center gap-6 cursor-pointer group w-80"
                >
                    <div className="w-full text-center">
                        <h2 className="text-3xl text-gray-600 mb-2 group-hover:text-black transition-colors font-light">Календарь</h2>
                        <div className="w-full h-[1px] bg-gray-400 group-hover:bg-black transition-colors"></div>
                    </div>

                    <div className="w-full aspect-square bg-[#F4F7FB] rounded-[40px] shadow-lg flex items-center justify-center border border-white transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl overflow-hidden">
                        <img
                            src="/patterns/Calendar.svg"
                            alt="Календарь"
                            className="w-[70%] h-[70%] object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                </div>

            </div>

            <div className="mt-auto mb-6 text-gray-500 font-light text-lg tracking-wider">
                By Spoogeek
            </div>
        </div>
    );
};