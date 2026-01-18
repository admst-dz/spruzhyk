import React from 'react';
import { useConfigurator } from '../store';

export const Home = ({ onStart }) => {
    const { setProduct } = useConfigurator();

    const handleSelect = (productType) => {
        setProduct(productType);
        onStart();
    };

    return (
        <div className="min-h-screen bg-[#E5E5E5] flex flex-col items-center justify-center font-zen overflow-x-hidden">

            <div className="text-center mb-16 space-y-2 px-4">
                <h1 className="text-4xl md:text-6xl font-black text-[#1a1a1a] tracking-widest uppercase" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    Конструктор
                </h1>
                <p className="text-gray-500 text-xs md:text-sm tracking-[0.2em] uppercase font-bold">
                    Создайте уникальный стиль Spruzhyk
                </p>
            </div>

            <div className="text-center mb-16">
                <h2 className="text-2xl font-bold text-[#1a1a1a]">ВЫБЕРИТЕ ИЗДЕЛИЕ</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 px-4 pb-20">

                {/* --- ТОВАР 1: ЕЖЕДНЕВНИК --- */}
                <div className="group relative flex flex-col items-center">

                    {/* ИНТЕРАКТИВНАЯ ИКОНКА (i) С ПОДСКАЗКОЙ */}
                    {/* group/info позволяет реагировать только на наведение на иконку */}
                    <div className="absolute top-0 right-10 md:right-0 z-40 group/info">

                        {/* Сама кнопка i */}
                        <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 font-serif font-bold cursor-help transition-colors hover:text-[#1e3a8a] relative z-50">
                            i
                        </div>

                        {/* Всплывающее описание (Овальная фигура) */}
                        <div className="absolute top-0 right-0 w-64 pt-12 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 transform origin-top-right z-40 pointer-events-none">
                            <div className="bg-white p-5 rounded-[20px] shadow-2xl border border-gray-100 text-left">
                                <p className="text-gray-600 text-xs font-sans leading-relaxed">
                                    Разработайте свой неповторимый ежедневник из высококачественного кожзама,
                                    добавьте различные элементы отделки, добавьте свой уникальный блок.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Кликабельная зона карточки (Сам товар) */}
                    <div onClick={() => handleSelect('notebook')} className="cursor-pointer flex flex-col items-center transition-transform hover:-translate-y-2 duration-300">
                        <div className="relative w-64 h-72 flex items-center justify-center">
                            {/* CSS Ежедневник */}
                            <div className="relative w-48 h-64 bg-[#1e3a8a] rounded-r-lg shadow-[10px_20px_40px_rgba(0,0,0,0.2)] group-hover:shadow-[15px_25px_50px_rgba(30,58,138,0.3)] transition-shadow">
                                <div className="absolute left-0 top-0 w-4 h-full bg-black/20 border-r border-white/5"></div>
                                <div className="absolute right-4 top-0 w-3 h-full bg-black/10"></div>
                                <div className="absolute right-0 top-1 w-1.5 h-[98%] bg-[#fcfcfc] rounded-r-sm translate-x-1 shadow-sm"></div>
                                <div className="absolute bottom-6 right-6 text-white/20 font-bold text-xs tracking-widest">LOGO</div>
                            </div>
                        </div>
                        <h3 className="mt-8 text-xl font-bold tracking-widest underline decoration-2 underline-offset-8 decoration-gray-300 group-hover:decoration-[#1e3a8a] group-hover:text-[#1e3a8a] transition-all">
                            ЕЖЕДНЕВНИК
                        </h3>
                    </div>
                </div>


                {/* --- ТОВАР 2: КАЛЕНДАРЬ --- */}
                <div onClick={() => handleSelect('calendar')}
                     className="group cursor-pointer flex flex-col items-center transition-transform hover:-translate-y-2 duration-300 relative">

                    {/* Для календаря иконка пока простая */}
                    <div className="absolute top-0 right-10 md:right-0 z-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 group-hover:text-blue-900 font-bold transition-colors">i</div>

                    <div className="relative w-64 h-72 flex items-center justify-center">
                        {/* CSS Календарь */}
                        <div className="relative w-64 h-40 mt-10 perspective-[1000px]">
                            <div className="absolute bottom-0 left-0 w-full h-full bg-[#172554] transform skew-x-12 origin-bottom-left rounded-lg shadow-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-full h-full bg-[#1e3a8a] rounded-lg shadow-[10px_20px_40px_rgba(0,0,0,0.2)] group-hover:shadow-[15px_25px_50px_rgba(30,58,138,0.3)] transition-shadow z-10 flex flex-col items-center justify-center border-t border-white/10">
                                <div className="w-[90%] h-[80%] bg-white shadow-inner rounded-sm flex items-center justify-center relative overflow-hidden">
                                    <div className="text-gray-200 font-bold text-6xl select-none">25</div>
                                    <div className="absolute top-0 w-full h-4 bg-gray-100 border-b border-gray-200"></div>
                                </div>
                            </div>
                            <div className="absolute -top-3 left-3 w-[90%] flex justify-evenly z-20">
                                {[1,2,3,4,5,6,7,8].map(i => (
                                    <div key={i} className="w-1.5 h-6 bg-gray-300 rounded-full border border-gray-400 shadow-sm"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <h3 className="mt-8 text-xl font-bold tracking-widest underline decoration-2 underline-offset-8 decoration-gray-300 group-hover:decoration-[#1e3a8a] group-hover:text-[#1e3a8a] transition-all">
                        КАЛЕНДАРЬ
                    </h3>
                </div>

            </div>

            <div className="mt-20 text-gray-400 text-xs font-bold uppercase tracking-[0.3em] pb-10">
                Spruzhyk Configurator
            </div>
        </div>
    );
};