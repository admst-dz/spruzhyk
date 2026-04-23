import { useState } from 'react';
import { useConfigurator } from "../store";
import { orderApi } from '../api';
import { Canvas } from '@react-three/fiber';
import { PresentationControls, Stage, Environment } from '@react-three/drei';
import { Notebook } from './Notebook';
import { Sketchbook } from './Sketchbook';

export const Order = ({ onBack, onSuccess }) => {
    const {
        format, coverColor, elasticColor, hasElastic,
        paperPattern, logos, bindingType, spiralColor,
        activeProduct
    } = useConfigurator();

    const [clientType, setClientType] = useState('phys');
    const [quantity, setQuantity] = useState(1);
    const [isSample, setIsSample] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', address: '', inn: '', contactPerson: '', comment: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuantityChange = (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 1) { setQuantity(val); } else if (e.target.value === '') { setQuantity(''); }
    };

    const handleQuantityBlur = () => {
        if (quantity === '' || quantity < 1) setQuantity(1);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone) {
            alert("Пожалуйста, заполните Имя и Телефон");
            return;
        }
        setLoading(true);
        try {
            await orderApi.createOrder({
                user_id: null,
                user_email: formData.email || '',
                product_name: 'Ежедневник',
                configuration: {
                    clientType,
                    contact: { ...formData },
                    isSample,
                    productConfig: {
                        type: activeProduct, format, bindingType, coverColor, hasElastic,
                        elasticColor: hasElastic ? elasticColor : null,
                        spiralColor: bindingType === 'spiral' ? spiralColor : null,
                        paperPattern, hasLogo: logos.length > 0,
                    },
                },
                quantity,
                total_price: null,
                currency: 'BYN',
                is_guest: true,
            });
            onSuccess();
        } catch (error) {
            console.error("Order error:", error);
            alert("Ошибка сети. Попробуйте позже.");
        } finally {
            setLoading(false);
        }
    };

    const patternNames = { blank: 'Пустой', lined: 'Линейка', grid: 'Клетка', dotted: 'Точка' };
    const bindingNames = { hard: 'Твердый', spiral: 'На пружине' };

    return (
        <div className="fixed inset-0 w-full h-full font-sans overflow-y-auto z-50 transition-colors duration-500
            bg-paper-100 dark:bg-[#0C0B09]">

            {/* Sticky header */}
            <div className="sticky top-0 z-30 px-6 md:px-8 py-4 flex items-center border-b backdrop-blur-xl
                border-paper-200 bg-paper-50/90 dark:border-white/[0.05] dark:bg-[#0C0B09]/90">
                <button onClick={onBack}
                    className="flex items-center gap-2 h-9 px-5 rounded-full border text-sm font-bold transition-all
                        border-paper-300 text-ink-700 bg-paper-50 hover:bg-paper-200
                        dark:border-white/10 dark:text-white/50 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Назад в редактор
                </button>
            </div>

            <div className="flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 md:px-8 gap-8 md:gap-12 pb-24 mt-6">

                {/* LEFT — preview */}
                <div className="w-full lg:w-2/5 flex flex-col gap-5">
                    <h2 className="font-display text-3xl font-300 text-ink-900 dark:text-[#F0EBE1]">Ваш макет</h2>

                    <div className="rounded-2xl border overflow-hidden shadow-[0_2px_24px_rgba(0,0,0,0.06)]
                        bg-white border-paper-200 dark:bg-white/[0.03] dark:border-white/[0.06]">
                        {activeProduct !== 'calendar' ? (
                            <div className="relative bg-paper-200/60 dark:bg-[#0A0E1A]" style={{ height: 280 }}>
                                <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ antialias: true }}>
                                    <Environment preset="city" />
                                    <ambientLight intensity={0.6} />
                                    <directionalLight position={[10, 10, 5]} intensity={1.5} />
                                    <directionalLight position={[-10, 5, 2]} intensity={0.5} />
                                    <PresentationControls speed={1.5} global polar={[-0.1, Math.PI / 4]}>
                                        <Stage environment={null} intensity={0} contactShadow={false}>
                                            {activeProduct === 'notebook' && <Notebook />}
                                            {activeProduct === 'sketchbook' && <Sketchbook />}
                                        </Stage>
                                    </PresentationControls>
                                </Canvas>
                                <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-ink-900/50 dark:bg-black/50 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10 pointer-events-none">
                                    <div className="w-6 h-6 text-white opacity-70"><BlockIconPreview type={paperPattern} /></div>
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-white/70">{patternNames[paperPattern]}</span>
                                </div>
                                <div className="absolute top-3 left-3 font-mono text-[8px] uppercase tracking-widest text-white/20 pointer-events-none">
                                    Перетащи для вращения
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 flex gap-4 h-56">
                                <div className="flex-1 rounded-xl shadow-inner relative overflow-hidden transition-colors duration-500 border border-black/5 dark:border-white/8" style={{ backgroundColor: coverColor }}>
                                    {hasElastic && (<div className="absolute top-0 right-[20%] w-3 h-full z-10" style={{ backgroundColor: elasticColor }} />)}
                                    {logos.length > 0 && (<div className="absolute bottom-4 right-4 font-mono text-[9px] text-white/50 border border-white/40 px-2 py-0.5 rounded">LOGO</div>)}
                                    <div className="absolute bottom-2 left-2 font-mono text-[8px] uppercase tracking-widest text-white/50">Обложка</div>
                                </div>
                                <div className="flex-1 bg-paper-100 dark:bg-white/[0.04] border border-paper-200 dark:border-white/8 rounded-xl relative flex items-center justify-center">
                                    <div className="w-20 h-20 opacity-30 text-ink-900 dark:text-white"><BlockIconPreview type={paperPattern} /></div>
                                    <div className="absolute bottom-2 left-2 font-mono text-[8px] uppercase tracking-widest text-paper-400 dark:text-white/25">Блок</div>
                                </div>
                            </div>
                        )}

                        <div className="p-6 border-t border-paper-100 dark:border-white/[0.04] space-y-3">
                            <Row label="Переплет" value={bindingNames[bindingType]} />
                            {bindingType === 'spiral' && <Row label="Пружина" value={<ColorDot color={spiralColor} />} />}
                            <Row label="Формат" value={format} />
                            <Row label="Обложка" value={<ColorDot color={coverColor} />} />
                            <Row label="Резинка" value={hasElastic ? <ColorDot color={elasticColor} /> : 'Нет'} />
                            <Row label="Разлиновка" value={patternNames[paperPattern]} />
                        </div>
                    </div>
                </div>

                {/* RIGHT — form */}
                <div className="w-full lg:flex-1 flex flex-col gap-5">
                    <h2 className="font-display text-3xl font-300 text-ink-900 dark:text-[#F0EBE1]">Оформление</h2>

                    <div className="rounded-2xl border p-6 md:p-8 shadow-[0_2px_24px_rgba(0,0,0,0.05)] space-y-7
                        bg-white border-paper-200 dark:bg-white/[0.03] dark:border-white/[0.06]">

                        {/* Type toggle */}
                        <div className="flex rounded-xl border p-1
                            border-paper-200 bg-paper-100 dark:border-white/8 dark:bg-white/[0.03]">
                            {[
                                { id: 'phys', label: 'Физ. лицо' },
                                { id: 'jur',  label: 'Юр. лицо' },
                            ].map(({ id, label }) => (
                                <button key={id} onClick={() => setClientType(id)}
                                    className={`flex-1 py-2.5 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${
                                        clientType === id
                                            ? 'bg-white text-ink-900 shadow-sm border border-paper-200 dark:bg-white/10 dark:text-white/80 dark:border-white/10'
                                            : 'text-paper-400 dark:text-white/25 hover:text-ink-700 dark:hover:text-white/50'
                                    }`}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {clientType === 'phys' ? (
                                <>
                                    <InputGroup name="name" label="ФИО" placeholder="Иванов Иван" value={formData.name} onChange={handleInputChange} />
                                    <InputGroup name="phone" label="Телефон" placeholder="+375..." type="tel" value={formData.phone} onChange={handleInputChange} />
                                    <InputGroup name="email" label="Email" placeholder="mail@example.com" type="email" value={formData.email} onChange={handleInputChange} />
                                    <InputGroup name="address" label="Адрес доставки" placeholder="Город..." value={formData.address} onChange={handleInputChange} />
                                </>
                            ) : (
                                <>
                                    <InputGroup name="name" label="Название компании" placeholder='ООО "Пример"' value={formData.name} onChange={handleInputChange} />
                                    <InputGroup name="inn" label="ИНН" placeholder="12345..." value={formData.inn} onChange={handleInputChange} />
                                    <InputGroup name="contactPerson" label="Контактное лицо" placeholder="ФИО" value={formData.contactPerson} onChange={handleInputChange} />
                                    <InputGroup name="phone" label="Телефон" placeholder="+375..." type="tel" value={formData.phone} onChange={handleInputChange} />
                                </>
                            )}
                            <div className="md:col-span-2">
                                <InputGroup name="comment" label="Комментарий" placeholder="Дополнительная информация..." isTextarea value={formData.comment} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between border-t border-paper-100 dark:border-white/[0.04] pt-6">
                            <div className="flex flex-col gap-2">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/25">Тираж (шт.)</span>
                                <div className="flex items-center gap-2 rounded-xl border p-1.5
                                    border-paper-200 bg-paper-100 dark:border-white/8 dark:bg-white/[0.03]">
                                    <button onClick={() => setQuantity(Number(quantity) > 1 ? Number(quantity) - 1 : 1)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg border font-bold text-lg transition-all hover:scale-105 active:scale-95
                                            border-paper-200 bg-white text-ink-800 dark:border-white/8 dark:bg-white/8 dark:text-white/70">
                                        −
                                    </button>
                                    <input type="number" min="1" value={quantity}
                                        onChange={handleQuantityChange} onBlur={handleQuantityBlur}
                                        className="w-14 bg-transparent text-center text-xl font-bold text-ink-900 dark:text-white/90 focus:outline-none"
                                    />
                                    <button onClick={() => setQuantity(Number(quantity) + 1)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg border font-bold text-lg transition-all hover:scale-105 active:scale-95
                                            border-paper-200 bg-white text-ink-800 dark:border-white/8 dark:bg-white/8 dark:text-white/70">
                                        +
                                    </button>
                                </div>
                            </div>

                            {clientType === 'jur' && (
                                <label className="flex items-center gap-4 cursor-pointer rounded-xl border px-5 py-4 transition-all w-full md:w-auto
                                    border-blue-200 bg-blue-50 hover:border-blue-300 dark:border-blue-500/15 dark:bg-blue-500/5 dark:hover:border-blue-500/30">
                                    <div className="relative flex items-center justify-center">
                                        <input type="checkbox" checked={isSample} onChange={(e) => setIsSample(e.target.checked)}
                                            className="peer appearance-none w-5 h-5 border-2 rounded transition-colors cursor-pointer
                                                border-blue-300 bg-white checked:bg-blue-600 checked:border-blue-600
                                                dark:border-blue-500/30 dark:bg-white/5" />
                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">Тиражный образец</span>
                                        <span className="font-mono text-[9px] uppercase tracking-wider text-blue-400 dark:text-blue-500/70">
                                            Изготовление 1 шт. перед партией
                                        </span>
                                    </div>
                                </label>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                className="py-4 rounded-xl border-2 font-bold uppercase tracking-widest transition-all text-sm flex items-center justify-center
                                    border-paper-200 text-paper-500 hover:border-paper-400 hover:text-ink-700
                                    dark:border-white/8 dark:text-white/25 dark:hover:border-white/20 dark:hover:text-white/60">
                                Консультация
                            </button>
                            <button
                                onClick={handleSubmit} disabled={loading}
                                className={`py-4 rounded-xl font-bold uppercase tracking-widest transition-all text-sm flex items-center justify-center gap-3
                                    bg-ink-900 text-white hover:bg-ink-800 active:scale-[0.98]
                                    dark:bg-transparent dark:border dark:border-[#C9A96E]/50 dark:text-[#C9A96E] dark:hover:bg-[#C9A96E]/10
                                    ${loading ? 'opacity-50 cursor-wait' : ''}`}
                            >
                                {loading ? 'Отправка...' : 'Оформить заказ'}
                                {!loading && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Row = ({ label, value }) => (
    <div className="flex justify-between items-center py-1">
        <span className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/25">{label}</span>
        <span className="font-bold text-sm text-ink-900 dark:text-white/80 text-right">{value}</span>
    </div>
);

const ColorDot = ({ color }) => (
    <div className="flex items-center justify-end gap-2">
        <div className="w-3 h-3 rounded-full border border-paper-300 dark:border-white/20" style={{ backgroundColor: color }} />
        <span className="font-mono text-[9px] uppercase tracking-wider text-ink-800 dark:text-white/70">{color}</span>
    </div>
);

const InputGroup = ({ label, placeholder, type = "text", isTextarea = false, value, onChange, name }) => (
    <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/25">{label}</label>
        {isTextarea ? (
            <textarea
                name={name} value={value} onChange={onChange} placeholder={placeholder}
                className="w-full p-4 rounded-xl border text-sm outline-none transition-all resize-none h-28
                    bg-paper-100 border-paper-200 text-ink-900 placeholder:text-paper-300
                    focus:border-paper-400 focus:bg-white
                    dark:bg-white/[0.04] dark:border-white/8 dark:text-white/80 dark:placeholder:text-white/15 dark:focus:border-white/20"
            />
        ) : (
            <input
                name={name} value={value} onChange={onChange} type={type} placeholder={placeholder}
                className="w-full p-4 rounded-xl border text-sm outline-none transition-all
                    bg-paper-100 border-paper-200 text-ink-900 placeholder:text-paper-300
                    focus:border-paper-400 focus:bg-white
                    dark:bg-white/[0.04] dark:border-white/8 dark:text-white/80 dark:placeholder:text-white/15 dark:focus:border-white/20"
            />
        )}
    </div>
);

const BlockIconPreview = ({ type }) => (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
        {type === 'lined' && <g stroke="currentColor" strokeWidth="4" opacity="0.3"><line x1="10" y1="30" x2="90" y2="30"/><line x1="10" y1="50" x2="90" y2="50"/><line x1="10" y1="70" x2="90" y2="70"/></g>}
        {type === 'grid' && <g stroke="currentColor" strokeWidth="3" opacity="0.3"><path d="M33 10 V90"/><path d="M66 10 V90"/><path d="M10 33 H90"/><path d="M10 66 H90"/></g>}
        {type === 'dotted' && <g fill="currentColor" opacity="0.4"><circle cx="33" cy="33" r="4"/><circle cx="66" cy="33" r="4"/><circle cx="33" cy="66" r="4"/><circle cx="66" cy="66" r="4"/></g>}
        {type === 'blank' && <text x="50" y="55" textAnchor="middle" fill="currentColor" opacity="0.2" fontSize="10" fontWeight="bold">BLANK</text>}
    </svg>
);
