import React, { useState } from 'react';
import { useConfigurator } from "../store";

export const Order = ({ onBack }) => {
    const {
        format, coverColor, elasticColor, hasElastic,
        paperPattern, logoTexture,
        bindingType, spiralColor
    } = useConfigurator();

    const [clientType, setClientType] = useState('phys');
    const [quantity, setQuantity] = useState(1);
    const [isSample, setIsSample] = useState(false);

    const patternNames = { blank: 'Пустой', lined: 'Линейка', grid: 'Клетка', dotted: 'Точка' };
    const bindingNames = { hard: 'Твердый', spiral: 'На пружине' };

    // Обработчик ручного ввода количества
    const handleQuantityChange = (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 1) {
            setQuantity(val);
        } else if (e.target.value === '') {
            setQuantity(''); // Разрешаем временно стереть число
        }
    };

    const handleQuantityBlur = () => {
        if (quantity === '' || quantity < 1) setQuantity(1); // При потере фокуса возвращаем 1
    };

    return (
        // FIXED + OVERFLOW-Y-AUTO гарантирует скролл
        <div className="fixed inset-0 w-full h-full bg-[#E5E5E5] font-zen overflow-y-auto z-50">

            {/* ШАПКА */}
            <div className="p-6 md:p-8 flex items-center sticky top-0 bg-[#E5E5E5]/90 backdrop-blur-md z-30">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-md text-sm font-bold text-[#1a1a1a] hover:scale-105 transition-transform border border-black/5"
                >
                    ← Назад в редактор
                </button>
            </div>

            {/* КОНТЕНТ (pb-32 дает отступ снизу, чтобы кнопки влезли) */}
            <div className="flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 gap-8 md:gap-16 pb-32 mt-4">

                {/* ЛЕВАЯ КОЛОНКА */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-wide uppercase">Ваш макет</h2>

                    <div className="bg-white p-6 rounded-[20px] shadow-xl flex flex-col gap-6 border border-white/50">
                        <div className="flex gap-4 h-64">
                            <div className="flex-1 rounded-[12px] shadow-inner relative overflow-hidden transition-colors duration-500 border border-black/5" style={{ backgroundColor: coverColor }}>
                                {hasElastic && (<div className="absolute top-0 right-[20%] w-4 h-full shadow-sm z-10" style={{ backgroundColor: elasticColor }} />)}
                                {logoTexture && (<div className="absolute bottom-6 right-6 text-white/50 text-xs font-bold border border-white/50 px-2 py-1 rounded">LOGO</div>)}
                                <div className="absolute bottom-2 left-2 text-white/60 text-[10px] font-bold tracking-wider">ОБЛОЖКА</div>
                                {bindingType === 'spiral' && (
                                    <div className="absolute left-0 top-0 h-full w-5 flex flex-col justify-evenly pl-1 bg-black/5 border-r border-black/5">
                                        {[1,2,3,4,5,6,7].map(i => <div key={i} className="w-3.5 h-2 rounded-full border border-black/20 shadow-sm ml-0.5" style={{backgroundColor: spiralColor === '#Silver' ? '#e0e0e0' : spiralColor}}/>)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 bg-white border border-gray-200 rounded-[12px] relative flex items-center justify-center">
                                <div className="w-24 h-24 opacity-80 text-black"><BlockIconPreview type={paperPattern} /></div>
                                <div className="absolute bottom-2 left-2 text-gray-400 text-[10px] font-bold tracking-wider">БЛОК</div>
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-gray-100 pt-5 text-sm font-bold text-[#1a1a1a]">
                            <Row label="Переплет" value={bindingNames[bindingType]} />
                            {bindingType === 'spiral' && <Row label="Пружина" value={<ColorDot color={spiralColor} />} />}
                            <Row label="Формат" value={format} />
                            <Row label="Обложка" value={<ColorDot color={coverColor} />} />
                            <Row label="Резинка" value={hasElastic ? <ColorDot color={elasticColor} /> : 'Нет'} />
                            <Row label="Разлиновка" value={patternNames[paperPattern]} />
                        </div>
                    </div>
                </div>

                {/* ПРАВАЯ КОЛОНКА */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-wide uppercase">Оформление</h2>

                    <div className="bg-white p-6 md:p-10 rounded-[20px] shadow-xl flex flex-col gap-8 border border-white/50">
                        <div className="bg-gray-100 p-1.5 rounded-[14px] flex shadow-inner">
                            <button onClick={() => setClientType('phys')} className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-widest rounded-[12px] transition-all duration-300 ${clientType === 'phys' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}>Физ. Лицо</button>
                            <button onClick={() => setClientType('jur')} className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-widest rounded-[12px] transition-all duration-300 ${clientType === 'jur' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}>Юр. Лицо</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {clientType === 'phys' ? (
                                <>
                                    <InputGroup label="ФИО" placeholder="Иванов Иван Иванович" />
                                    <InputGroup label="Телефон" placeholder="+7 (___) ___-__-__" type="tel" />
                                    <InputGroup label="Email" placeholder="mail@example.com" type="email" />
                                    <InputGroup label="Адрес доставки" placeholder="Город, улица, дом..." />
                                </>
                            ) : (
                                <>
                                    <InputGroup label="Название компании" placeholder='ООО "Компания"' />
                                    <InputGroup label="ИНН" placeholder="1234567890" />
                                    <InputGroup label="Юридический адрес" placeholder="Индекс, Город, ул..." />
                                    <InputGroup label="Контактное лицо" placeholder="ФИО менеджера" />
                                    <InputGroup label="Телефон" placeholder="+7 (___) ___-__-__" type="tel" />
                                    <InputGroup label="Email" placeholder="corp@company.com" type="email" />
                                </>
                            )}
                            <div className="md:col-span-2">
                                <InputGroup label="Комментарий к заказу" placeholder="Пожелания по срокам, доставке или упаковке..." isTextarea={true} />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 md:items-end justify-between border-t border-gray-100 pt-8 mt-2">

                            {/* ПОЛЕ ВВОДА ТИРАЖА */}
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Тираж (шт.)</span>
                                <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-[14px] p-2 border border-gray-200 w-max shadow-sm">
                                    <button
                                        onClick={() => setQuantity(Number(quantity) > 1 ? Number(quantity) - 1 : 1)}
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-[10px] shadow-sm font-bold text-xl hover:scale-105 active:scale-95 transition"
                                    >-</button>

                                    {/* INPUT NUMBER */}
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        onBlur={handleQuantityBlur}
                                        className="w-16 bg-transparent text-center text-2xl font-black text-[#1a1a1a] focus:outline-none"
                                    />

                                    <button
                                        onClick={() => setQuantity(Number(quantity) + 1)}
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-[10px] shadow-sm font-bold text-xl hover:scale-105 active:scale-95 transition"
                                    >+</button>
                                </div>
                            </div>

                            {clientType === 'jur' && (
                                <label className="flex items-center gap-4 cursor-pointer group bg-[#EAF4FF] px-5 py-4 rounded-[16px] border border-blue-100 hover:border-blue-300 transition-all w-full md:w-auto">
                                    <div className="relative flex items-center justify-center">
                                        <input type="checkbox" checked={isSample} onChange={(e) => setIsSample(e.target.checked)} className="peer appearance-none w-6 h-6 border-2 border-blue-300 rounded bg-white checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-colors" />
                                        <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <div className="flex flex-col"><span className="font-bold text-[#1e3a8a] text-sm uppercase tracking-wide">Тиражный образец</span><span className="text-[10px] font-bold text-blue-400">Изготовление 1 шт. перед партией</span></div>
                                </label>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <button className="py-5 rounded-[14px] border-2 border-gray-200 text-gray-500 font-bold uppercase tracking-widest hover:border-gray-400 hover:text-black transition flex items-center justify-center gap-2 group">
                                <span>Консультация</span>
                            </button>
                            <button className="py-5 rounded-[14px] bg-[#1a1a1a] text-white font-bold uppercase tracking-widest hover:bg-black hover:shadow-lg transition flex items-center justify-center gap-3 active:scale-[0.98]">
                                <span>Оформить Заказ</span> <span className="text-xl">→</span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

const Row = ({ label, value }) => (<div className="flex justify-between items-center py-1"><span className="text-gray-400 font-bold text-xs uppercase tracking-wider">{label}</span><span className="font-bold text-[#1a1a1a] text-right">{value}</span></div>)
const ColorDot = ({ color }) => (<div className="flex items-center justify-end gap-2"><div className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: color }} /><span className="uppercase text-xs font-black text-[#1a1a1a]">{color}</span></div>)
const InputGroup = ({ label, placeholder, type = "text", isTextarea = false }) => (<div className="flex flex-col gap-2"><label className="text-[10px] font-bold uppercase text-gray-400 ml-1 tracking-widest">{label}</label>{isTextarea ? (<textarea placeholder={placeholder} className="w-full p-4 bg-[#F9F9F9] border border-gray-200 rounded-[14px] text-[#1a1a1a] font-bold focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white placeholder-gray-400 transition-all resize-none h-32"/>) : (<input type={type} placeholder={placeholder} className="w-full p-4 bg-[#F9F9F9] border border-gray-200 rounded-[14px] text-[#1a1a1a] font-bold focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white placeholder-gray-400 transition-all"/>)}</div>)
const BlockIconPreview = ({ type }) => (<svg viewBox="0 0 100 100" fill="none" className="w-full h-full">{type === 'lined' && <g stroke="#1a1a1a" strokeWidth="4" opacity="0.3"><line x1="10" y1="30" x2="90" y2="30"/><line x1="10" y1="50" x2="90" y2="50"/><line x1="10" y1="70" x2="90" y2="70"/></g>}{type === 'grid' && <g stroke="#1a1a1a" strokeWidth="3" opacity="0.3"><path d="M33 10 V90"/><path d="M66 10 V90"/><path d="M10 33 H90"/><path d="M10 66 H90"/></g>}{type === 'dotted' && <g fill="#1a1a1a" opacity="0.4"><circle cx="33" cy="33" r="4"/><circle cx="66" cy="33" r="4"/><circle cx="33" cy="66" r="4"/><circle cx="66" cy="66" r="4"/></g>}{type === 'blank' && <text x="50" y="55" textAnchor="middle" fill="#1a1a1a" opacity="0.2" fontSize="10" fontWeight="bold">BLANK</text>}</svg>)