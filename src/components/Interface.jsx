import React, { useState } from 'react';
import { useConfigurator } from "../store"

const palette = [
    { name: 'Yellow', bg: '#FDD835' },
    { name: 'Red', bg: '#D32F2F' },
    { name: 'Green', bg: '#43A047' },
    { name: 'Black', bg: '#1a1a1a' },
    { name: 'Blue', bg: '#1565C0' },
    { name: 'White', bg: '#ffffff' },
    { name: 'Pink', bg: '#EC407A' },
];

export const Interface = () => {
    const [tab, setTab] = useState('cover');

    const {
        format, setFormat,
        setColor, coverColor, elasticColor,
        hasElastic, setHasElastic,
        setNotebookOpen,
        paperPattern, setPaperPattern,
        setLogo, logoPosition, setLogoPosition
    } = useConfigurator();

    return (
        // ГЛАВНЫЙ КОНТЕЙНЕР
        <div className="pointer-events-auto w-full h-[95%] bg-[#E2E6F2]/80 backdrop-blur-xl rounded-[30px] shadow-2xl flex flex-col overflow-hidden font-kyiv border border-white/40">

            {/* --- ВЕРХНИЕ ТАБЫ --- */}
            <div className="flex items-end gap-6 px-8 py-8">
                <button
                    onClick={() => { setTab('cover'); setNotebookOpen(false); }}
                    className={`text-3xl transition-all decoration-4 underline-offset-8 leading-none ${
                        tab === 'cover'
                            ? 'text-white underline decoration-white opacity-100 font-bold scale-105 shadow-black drop-shadow-md'
                            : 'text-white/60 hover:text-white hover:opacity-100'
                    }`}
                    style={{ textShadow: tab==='cover' ? '0 2px 10px rgba(0,0,0,0.1)' : 'none' }}
                >
                    Обложка
                </button>
                <button
                    onClick={() => { setTab('block'); setNotebookOpen(true); }}
                    className={`text-3xl transition-all decoration-4 underline-offset-8 leading-none ${
                        tab === 'block'
                            ? 'text-white underline decoration-white opacity-100 font-bold scale-105 drop-shadow-md'
                            : 'text-white/60 hover:text-white hover:opacity-100'
                    }`}
                >
                    Блок
                </button>
            </div>

            {/* --- ВНУТРЕННИЙ СИНИЙ КОНТЕЙНЕР --- */}
            <div className="flex-1 bg-[#5F90D8] rounded-[24px] mx-3 mb-3 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 shadow-inner ring-1 ring-white/10">

                {/* === ВКЛАДКА ОБЛОЖКА (Без изменений) === */}
                {tab === 'cover' && (
                    <div className="animate-fade-in flex flex-col gap-3">
                        {/* ФОРМАТ */}
                        <CustomDropdown label="Формат" currentValue={format}>
                            <div className="flex flex-col gap-1 p-1">
                                {['A5', 'A6'].map(f => (
                                    <button key={f} onClick={() => setFormat(f)}
                                            className={`py-3 px-4 text-left rounded-[6px] transition-colors flex justify-between items-center font-manrope ${
                                                format === f ? 'bg-white/20 font-bold' : 'hover:bg-white/10'
                                            }`}>
                                        <span>{f}</span>
                                        {format === f && <span>✓</span>}
                                    </button>
                                ))}
                            </div>
                        </CustomDropdown>

                        {/* РЕЗИНКА */}
                        <div className="bg-[#AAC7FF] rounded-[9px] overflow-hidden transition-all shadow-sm">
                            <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-black/5 transition"
                                 onClick={() => setHasElastic(!hasElastic)}
                            >
                                <span className="text-[#1a1a1a] text-lg font-bold tracking-wide">Резинка</span>
                                <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 border border-black/5 ${hasElastic ? 'bg-[#43A047]' : 'bg-gray-400'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${hasElastic ? 'translate-x-6' : ''}`} />
                                </div>
                            </div>

                            {hasElastic && (
                                <div className="border-t border-black/5">
                                    <ColorDropdownList
                                        currentColor={elasticColor}
                                        onSelect={(c) => setColor('elastic', c)}
                                        label="Цвет резинки"
                                    />
                                </div>
                            )}
                        </div>

                        {/* ЦВЕТ ОБЛОЖКИ */}
                        <div className="bg-[#AAC7FF] rounded-[9px] overflow-hidden shadow-sm">
                            <ColorDropdownList
                                currentColor={coverColor}
                                onSelect={(c) => setColor('cover', c)}
                                label="Цвет обложки"
                            />
                        </div>

                        {/* ТИСНЕНИЕ */}
                        <div className="bg-[#AAC7FF] rounded-[9px] p-5 shadow-sm">
                            <h3 className="text-[#1a1a1a] text-lg font-bold tracking-wide mb-3">Тиснение</h3>
                            <label className="block w-full py-3 bg-[#8FAEE8]/50 rounded-[6px] text-center cursor-pointer hover:bg-[#8FAEE8] transition border border-[#5F90D8]/30 text-[#1a1a1a] font-manrope text-sm font-bold shadow-sm mb-4">
                                Выбрать Файл
                                <input type="file" onChange={(e) => setLogo(e.target.files[0])} className="hidden"/>
                            </label>
                            <div className="space-y-4 font-manrope text-xs font-bold text-black/50">
                                <div className="flex items-center gap-3">
                                    <span className="w-4">X</span>
                                    <input type="range" min="-0.4" max="0.4" step="0.01" value={logoPosition[0]} onChange={(e) => setLogoPosition(parseFloat(e.target.value), logoPosition[1])}
                                           className="w-full h-1.5 bg-[#8FAEE8] rounded-full appearance-none accent-[#0054FF] cursor-pointer"/>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-4">Y</span>
                                    <input type="range" min="-0.8" max="0.8" step="0.01" value={logoPosition[1]} onChange={(e) => setLogoPosition(logoPosition[0], parseFloat(e.target.value))}
                                           className="w-full h-1.5 bg-[#8FAEE8] rounded-full appearance-none accent-[#0054FF] cursor-pointer"/>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* === ВКЛАДКА БЛОК БУМАГИ (ОБНОВЛЕНО) === */}
                {tab === 'block' && (
                    <div className="animate-fade-in flex flex-col h-full">
                        <div className="bg-[#AAC7FF] text-[#1a1a1a] p-3 mb-4 rounded-[9px] text-sm opacity-90 font-kyiv leading-relaxed border border-white/20 text-center">
                            Выберите разлиновку:
                        </div>

                        {/* СЕТКА 2x2 */}
                        <div className="grid grid-cols-2 gap-3 h-full content-start">
                            {['blank', 'lined', 'grid', 'dotted'].map((pt) => (
                                <button
                                    key={pt}
                                    onClick={() => setPaperPattern(pt)}
                                    className={`
                                        aspect-square flex flex-col items-center justify-center gap-3 
                                        rounded-[20px] transition-all duration-300 group
                                        ${paperPattern === pt
                                        ? 'bg-white text-[#0054FF] shadow-lg scale-[1.02]'
                                        : 'bg-[#AAC7FF] text-black/70 hover:bg-[#b8d1ff] hover:text-black'}
                                    `}
                                >
                                    {/* ИКОНКА */}
                                    <div className={`w-16 h-16 rounded-xl border-2 transition-all p-2 ${
                                        paperPattern === pt ? 'border-[#0054FF]/20 bg-[#0054FF]/5' : 'border-black/5 bg-white/20'
                                    }`}>
                                        <BlockIcon type={pt} />
                                    </div>

                                    {/* ТЕКСТ */}
                                    <span className="font-kyiv font-bold text-lg tracking-wide">
                                        {pt === 'blank' && 'Пустой'}
                                        {pt === 'lined' && 'Линейка'}
                                        {pt === 'grid' && 'Клетка'}
                                        {pt === 'dotted' && 'Точка'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* КНОПКА ЗАКАЗА */}
            <div className="p-5 mt-auto">
                <button className="w-full py-4 bg-[#1a1a1a] rounded-[15px] text-white font-kyiv text-lg tracking-widest uppercase hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0">
                    В Корзину
                </button>
            </div>
        </div>
    )
}

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const CustomDropdown = ({ label, currentValue, children, isColor = false, colorValue }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-[#AAC7FF] rounded-[9px] transition-all overflow-hidden shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-5 flex items-center justify-between hover:bg-black/5 transition"
            >
                <span className="text-[#1a1a1a] text-lg font-bold tracking-wide">{label}</span>
                <div className="flex items-center gap-3">
                    {isColor ? (
                        <div className="w-6 h-6 rounded-full border border-black/10 shadow-sm ring-2 ring-white/50" style={{backgroundColor: colorValue}} />
                    ) : (
                        <span className="font-manrope font-bold opacity-60 text-sm bg-black/5 px-2 py-1 rounded">{currentValue}</span>
                    )}
                    <span className={`transform transition-transform duration-300 text-lg opacity-50 ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
                </div>
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-2 border-t border-black/5 bg-[#9ABBF2]/50">{children}</div>
            </div>
        </div>
    )
}

const ColorDropdownList = ({ label, currentColor, onSelect }) => (
    <CustomDropdown label={label} isColor={true} colorValue={currentColor}>
        <div className="flex flex-col gap-1">
            {palette.map((c) => (
                <button key={c.name} onClick={() => onSelect(c.bg)} className={`p-2 rounded-[6px] flex items-center gap-3 transition-colors ${currentColor === c.bg ? 'bg-white/40 shadow-sm' : 'hover:bg-white/20'}`}>
                    <div className="w-8 h-8 rounded-full border border-black/10 shadow-sm ring-1 ring-white" style={{backgroundColor: c.bg}} />
                    <span className="font-manrope font-bold text-sm text-[#1a1a1a]">{c.name}</span>
                    {currentColor === c.bg && <span className="ml-auto opacity-50">✓</span>}
                </button>
            ))}
        </div>
    </CustomDropdown>
)

// --- ИКОНКИ ДЛЯ БЛОКОВ (SVG) ---
const BlockIcon = ({ type }) => {
    // Общие стили для линий внутри иконки
    const strokeClass = "stroke-current opacity-60";

    return (
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
            {/* Рамка листа */}
            <rect x="10" y="10" width="80" height="80" rx="4" stroke="currentColor" strokeWidth="2" className="opacity-30" />

            {type === 'blank' && (
                // Просто пустой лист, ничего не рисуем
                <path d="M50 40 L50 60 M40 50 L60 50" stroke="currentColor" strokeWidth="2" className="opacity-10" /> // Легкий плюсик
            )}

            {type === 'lined' && (
                // Линии
                <g strokeWidth="3" className={strokeClass}>
                    <line x1="20" y1="30" x2="80" y2="30" />
                    <line x1="20" y1="50" x2="80" y2="50" />
                    <line x1="20" y1="70" x2="80" y2="70" />
                </g>
            )}

            {type === 'grid' && (
                // Сетка
                <g strokeWidth="2" className={strokeClass}>
                    <path d="M33 20 V80" />
                    <path d="M66 20 V80" />
                    <path d="M20 33 H80" />
                    <path d="M20 66 H80" />
                </g>
            )}

            {type === 'dotted' && (
                // Точки
                <g fill="currentColor" className="opacity-60">
                    <circle cx="33" cy="33" r="3" /> <circle cx="66" cy="33" r="3" />
                    <circle cx="33" cy="66" r="3" /> <circle cx="66" cy="66" r="3" />
                </g>
            )}
        </svg>
    )
}