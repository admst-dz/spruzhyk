import React, { useState } from 'react';
import { useConfigurator } from "../store";

export const Order = ({ onBack }) => {
    const {
        format, coverColor, elasticColor, hasElastic,
        paperPattern, logoTexture,
        bindingType, spiralColor // Новые параметры
    } = useConfigurator();

    const [clientType, setClientType] = useState('phys');
    const [quantity, setQuantity] = useState(1);
    const [isSample, setIsSample] = useState(false);

    const patternNames = { blank: 'Пустой', lined: 'Линейка', grid: 'Клетка', dotted: 'Точка' };
    const bindingNames = { hard: 'Твердый', spiral: 'На пружине' };

    return (
        <div className="w-full min-h-screen bg-[#E5E5E5] font-zen flex flex-col animate-fade-in overflow-y-auto">

            <div className="p-6 md:p-10 flex items-center">
                <button onClick={onBack} className="flex items-center gap-2 px-5 py-2 bg-white rounded-full shadow-md text-sm font-bold text-[#1a1a1a] hover:scale-105 transition-transform">← Назад</button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 md:px-10 pb-20 gap-10 md:gap-20">

                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <h2 className="text-3xl font-bold text-[#1a1a1a]">ВАШ ИТОГ</h2>

                    {/* CSS ПРЕВЬЮ */}
                    <div className="bg-white p-6 rounded-[20px] shadow-xl flex flex-col gap-6">
                        <div className="flex gap-4 h-64">

                            {/* ЕЖЕДНЕВНИК (Превью) */}
                            <div className="flex-1 rounded-[10px] shadow-inner relative overflow-hidden transition-colors duration-500" style={{ backgroundColor: coverColor }}>
                                {hasElastic && (<div className="absolute top-0 right-[20%] w-4 h-full shadow-sm z-10" style={{ backgroundColor: elasticColor }} />)}
                                {logoTexture && (<div className="absolute bottom-6 right-6 text-white/50 text-xs font-bold border border-white/50 px-2 py-1 rounded">LOGO</div>)}
                                <div className="absolute bottom-2 left-2 text-white/40 text-[10px] font-bold">ОБЛОЖКА</div>

                                {/* Пружина визуализация в превью */}
                                {bindingType === 'spiral' && (
                                    <div className="absolute left-0 top-0 h-full w-4 flex flex-col justify-evenly pl-1">
                                        {[1,2,3,4,5,6,7].map(i => <div key={i} className="w-3 h-2 rounded-full border border-black/10 shadow-sm" style={{backgroundColor: spiralColor === '#Silver' ? '#ddd' : spiralColor}}/>)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 bg-white border border-gray-200 rounded-[10px] relative flex items-center justify-center">
                                <div className="w-20 h-20 opacity-20 text-black"><BlockIconPreview type={paperPattern} /></div>
                                <div className="absolute bottom-2 left-2 text-gray-400 text-[10px] font-bold">БЛОК</div>
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-gray-100 pt-4 text-sm text-[#1a1a1a]">
                            <Row label="Переплет" value={bindingNames[bindingType]} />
                            {bindingType === 'spiral' && <Row label="Пружина" value={<ColorDot color={spiralColor} />} />}
                            <Row label="Формат" value={format} />
                            <Row label="Обложка" value={<ColorDot color={coverColor} />} />
                            <Row label="Резинка" value={hasElastic ? <ColorDot color={elasticColor} /> : 'Нет'} />
                            <Row label="Блок" value={patternNames[paperPattern]} />
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-2/3 flex flex-col gap-6">
                    <h2 className="text-3xl font-bold text-[#1a1a1a]">ОФОРМЛЕНИЕ</h2>
                    <div className="bg-white p-6 md:p-10 rounded-[20px] shadow-xl flex flex-col gap-8">
                        <div className="bg-gray-100 p-1 rounded-[12px] flex">
                            <button onClick={() => setClientType('phys')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-[10px] transition-all ${clientType === 'phys' ? 'bg-white shadow-md text-black' : 'text-gray-400'}`}>Физическое лицо</button>
                            <button onClick={() => setClientType('jur')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-[10px] transition-all ${clientType === 'jur' ? 'bg-white shadow-md text-black' : 'text-gray-400'}`}>Юридическое лицо</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Имя / Компания" placeholder={clientType === 'phys' ? "Иван Иванов" : "ООО Спружык"} />
                            <InputGroup label="Телефон" placeholder="+7 (999) 000-00-00" />
                            <InputGroup label="Email" placeholder="mail@example.com" />
                            {clientType === 'jur' && <InputGroup label="ИНН" placeholder="Для счета" />}
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between border-t border-gray-100 pt-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-gray-400 uppercase">Количество</span>
                                <div className="flex items-center gap-4 bg-gray-50 rounded-[12px] p-2 border border-gray-200 w-max">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold">-</button>
                                    <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold">+</button>
                                </div>
                            </div>
                            {clientType === 'jur' && (
                                <label className="flex items-center gap-3 cursor-pointer group bg-blue-50 px-4 py-3 rounded-[12px] border border-blue-100 hover:bg-blue-100 transition">
                                    <input type="checkbox" checked={isSample} onChange={(e) => setIsSample(e.target.checked)} className="w-5 h-5 accent-blue-600 rounded cursor-pointer" />
                                    <div className="flex flex-col"><span className="font-bold text-[#1e3a8a] text-sm">Тиражный образец</span><span className="text-[10px] text-blue-400">Пробный экземпляр</span></div>
                                </label>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <button className="py-4 rounded-[12px] border-2 border-gray-200 text-gray-500 font-bold uppercase tracking-wider hover:border-gray-400 transition">Согласовать с менеджером</button>
                            <button className="py-4 rounded-[12px] bg-[#1a1a1a] text-white font-bold uppercase tracking-wider hover:bg-black transition shadow-xl">Оформить Заказ →</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Row = ({ label, value }) => (<div className="flex justify-between items-center"><span className="text-gray-400">{label}</span><span className="font-bold">{value}</span></div>)
const ColorDot = ({ color }) => (<div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: color }} /><span className="uppercase text-xs">{color}</span></div>)
const InputGroup = ({ label, placeholder }) => (<div className="flex flex-col gap-2"><label className="text-xs font-bold uppercase text-gray-400 ml-1">{label}</label><input type="text" placeholder={placeholder} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"/></div>)
const BlockIconPreview = ({ type }) => (<svg viewBox="0 0 100 100" fill="none" className="w-full h-full">{type === 'lined' && <g stroke="currentColor" strokeWidth="4" opacity="0.2"><line x1="10" y1="30" x2="90" y2="30"/><line x1="10" y1="50" x2="90" y2="50"/><line x1="10" y1="70" x2="90" y2="70"/></g>}{type === 'grid' && <g stroke="currentColor" strokeWidth="3" opacity="0.2"><path d="M33 10 V90"/><path d="M66 10 V90"/><path d="M10 33 H90"/><path d="M10 66 H90"/></g>}{type === 'dotted' && <g fill="currentColor" opacity="0.3"><circle cx="33" cy="33" r="4"/><circle cx="66" cy="33" r="4"/><circle cx="33" cy="66" r="4"/><circle cx="66" cy="66" r="4"/></g>}{type === 'blank' && <text x="50" y="55" textAnchor="middle" fill="currentColor" opacity="0.1" fontSize="10">BLANK</text>}</svg>)