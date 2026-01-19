import React from 'react';
import { useConfigurator } from '../store';

export const Home = ({ onStart }) => {
    const { setProduct } = useConfigurator();

    const handleSelect = (productType) => {
        setProduct(productType);
        onStart();
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center py-10 font-zen bg-gradient-to-br from-[#EAF4FF] via-[#DEECFF] to-[#CDE2FF]">

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

                        {/* ЗАГРУЗКА ВАШЕГО SVG */}
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

                        {/* ЗАГРУЗКА ВАШЕГО SVG */}
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