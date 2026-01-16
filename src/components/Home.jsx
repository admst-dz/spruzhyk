import React from 'react';
import { useConfigurator } from '../store';

export const Home = ({ onStart }) => {
    const { setProduct } = useConfigurator();

    // Обработчик выбора товара
    const handleSelect = (productType) => {
        setProduct(productType);
        onStart(); // Переключаем экран в App.jsx
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">

            <div className="text-center mb-16 space-y-2">
                <h1 className="text-4xl md:text-5xl font-medium text-black tracking-tight">
                    Конструктор ежедневников
                </h1>
                <p className="text-gray-400 text-sm md:text-base font-light">
                    Создайте свое уникальное изделие бренда "Спружык"
                </p>
            </div>

            <div className="text-center mb-12">
                <h2 className="text-2xl font-medium text-black">Выберите изделие</h2>
            </div>

            {/* СЕТКА ТОВАРОВ: 2 колонки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

                {/* --- ТОВАР 1: ЕЖЕДНЕВНИК --- */}
                <div onClick={() => handleSelect('notebook')}
                     className="group cursor-pointer flex flex-col items-center transition-transform hover:-translate-y-2 duration-300">
                    <div className="relative w-64 h-72 flex items-center justify-center">
                        <div className="absolute -top-2 -right-2 z-20 w-8 h-8 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-teal-500">i</div>
                        {/* CSS Ежедневник */}
                        <div className="relative w-48 h-64 bg-teal-500 rounded-r-lg shadow-[10px_10px_20px_rgba(0,0,0,0.1)] group-hover:shadow-[15px_15px_30px_rgba(20,184,166,0.2)] transition-shadow">
                            <div className="absolute left-0 top-0 w-3 h-full bg-black/10 border-r border-white/10"></div>
                            <div className="absolute right-4 top-0 w-2 h-full bg-black/5"></div>
                            <div className="absolute right-0 top-1 w-1 h-[98%] bg-white rounded-r-sm translate-x-1"></div>
                        </div>
                    </div>
                    <h3 className="mt-6 text-lg underline decoration-1 underline-offset-4 decoration-gray-300 group-hover:decoration-teal-500 group-hover:text-teal-600 transition-colors">Ежедневник</h3>
                </div>

                {/* --- ТОВАР 2: КАЛЕНДАРЬ --- */}
                <div onClick={() => handleSelect('calendar')}
                     className="group cursor-pointer flex flex-col items-center transition-transform hover:-translate-y-2 duration-300">
                    <div className="relative w-64 h-72 flex items-center justify-center">
                        <div className="absolute -top-2 -right-2 z-20 w-8 h-8 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-teal-500">i</div>

                        {/* CSS Календарь (Альбомная ориентация) */}
                        <div className="relative w-60 h-40 mt-10">
                            {/* Задняя ножка (тень) */}
                            <div className="absolute bottom-0 left-0 w-full h-full bg-teal-700 transform skew-x-12 origin-bottom-left rounded-lg"></div>
                            {/* Передняя сторона */}
                            <div className="absolute bottom-0 left-0 w-full h-full bg-teal-500 rounded-lg shadow-[10px_10px_20px_rgba(0,0,0,0.1)] group-hover:shadow-[15px_15px_30px_rgba(20,184,166,0.2)] transition-shadow z-10 flex flex-col items-center justify-center">
                                {/* Листы календаря */}
                                <div className="w-[90%] h-[80%] bg-white shadow-inner rounded flex items-center justify-center">
                                    <div className="text-gray-200 font-bold text-4xl">25</div>
                                </div>
                            </div>
                            {/* Пружина сверху (набор колечек) */}
                            <div className="absolute -top-3 left-2 w-[90%] flex justify-evenly z-20">
                                {[1,2,3,4,5,6].map(i => (
                                    <div key={i} className="w-2 h-6 bg-gray-300 rounded-full border border-gray-400"></div>
                                ))}
                            </div>
                        </div>

                    </div>
                    <h3 className="mt-6 text-lg underline decoration-1 underline-offset-4 decoration-gray-300 group-hover:decoration-teal-500 group-hover:text-teal-600 transition-colors">
                        Календарь настольный
                    </h3>
                </div>

            </div>

            <div className="mt-24 text-gray-300 text-sm font-bold uppercase tracking-widest">
                Spruzhyk
            </div>
        </div>
    );
};