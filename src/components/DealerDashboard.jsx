import { useState, useEffect } from 'react';
import { useConfigurator } from "../store";
import { fetchAllOrders, updateOrderStatus, fetchDealerProducts, saveProduct, updateProduct, deleteProduct } from '../api';

const statusConfig = {
    new:        { text: 'Новый',          cls: 'bg-black/[0.04] text-[#1D1D1F]/50 border-black/[0.06] dark:bg-white/[0.05] dark:text-white/30 dark:border-white/[0.08]' },
    production: { text: 'В производстве', cls: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/[0.12] dark:text-indigo-400 dark:border-indigo-500/20' },
    processing: { text: 'В обработке',    cls: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/[0.12] dark:text-blue-400 dark:border-blue-500/20' },
    in_delivery:{ text: 'Доставляется',   cls: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-yellow-500/[0.12] dark:text-yellow-400 dark:border-yellow-500/20' },
    done:       { text: 'Готово',         cls: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/[0.12] dark:text-emerald-400 dark:border-emerald-500/20' },
};

const StatusBadge = ({ status }) => {
    const s = statusConfig[status] || { text: status, cls: 'bg-black/[0.04] text-[#1D1D1F]/50 border-black/[0.06] dark:bg-white/[0.05] dark:text-white/30 dark:border-white/[0.08]' };
    return <span className={`px-2.5 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider border ${s.cls}`}>{s.text}</span>;
};

const CheckToggle = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
        <div onClick={onChange}
            className={`w-[18px] h-[18px] rounded-md border flex items-center justify-center transition-all shrink-0 ${
                checked
                    ? 'bg-[#1D1D1F] border-[#1D1D1F] dark:bg-white dark:border-white'
                    : 'border-black/[0.15] bg-black/[0.03] group-hover:border-black/[0.25] dark:border-white/[0.15] dark:bg-white/[0.04] dark:group-hover:border-white/[0.3]'
            }`}>
            {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke={`${true ? '#0B0F19' : 'white'}`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="dark:[stroke:#0B0F19] [stroke:#FFFFFF]"/></svg>}
        </div>
        <span className="text-sm text-[#1D1D1F]/70 dark:text-white/55 group-hover:text-[#1D1D1F] dark:group-hover:text-white/80 transition-colors">{label}</span>
    </label>
);

const ColorChip = ({ color, onRemove }) => (
    <div className="flex items-center gap-2 rounded-full px-2.5 py-1 border
        bg-black/[0.03] border-black/[0.07] dark:bg-white/[0.05] dark:border-white/[0.09]">
        <div className="w-3 h-3 rounded-full border border-black/10 dark:border-white/15 shrink-0" style={{ backgroundColor: color.hex }} />
        <span className="font-mono text-[9px] text-[#1D1D1F]/55 dark:text-white/45">{color.name}</span>
        {onRemove && <button onClick={onRemove} className="text-[#1D1D1F]/25 dark:text-white/20 hover:text-red-500 transition-colors leading-none ml-0.5">×</button>}
    </div>
);

const ColorInput = ({ value, onChange, onAdd }) => (
    <div className="flex gap-2 mt-2">
        <input type="color" value={value.hex || '#ffffff'} onChange={e => onChange({ ...value, hex: e.target.value })}
            className="w-9 h-9 rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-transparent cursor-pointer p-0.5 shrink-0" />
        <input type="text" placeholder="#ff0000" value={value.hex} onChange={e => onChange({ ...value, hex: e.target.value })}
            className="w-24 rounded-xl border px-3 py-2 text-sm outline-none transition-all
                bg-black/[0.03] border-black/[0.08] text-[#1D1D1F] placeholder:text-[#1D1D1F]/25
                focus:border-black/[0.2] dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white/80 dark:placeholder:text-white/15 dark:focus:border-white/20" />
        <input type="text" placeholder="Название" value={value.name} onChange={e => onChange({ ...value, name: e.target.value })}
            className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition-all
                bg-black/[0.03] border-black/[0.08] text-[#1D1D1F] placeholder:text-[#1D1D1F]/25
                focus:border-black/[0.2] dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white/80 dark:placeholder:text-white/15 dark:focus:border-white/20" />
        <button onClick={onAdd} disabled={!value.hex}
            className="px-3 py-2 rounded-xl border text-sm font-semibold transition-all
                bg-black/[0.04] border-black/[0.08] text-[#1D1D1F]/70 hover:bg-black/[0.08]
                dark:bg-white/[0.06] dark:border-white/[0.1] dark:text-white/60 dark:hover:bg-white/[0.12] disabled:opacity-30">+</button>
    </div>
);

const Section = ({ title, children }) => (
    <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#1D1D1F]/35 dark:text-white/25 mb-3">{title}</p>
        {children}
    </div>
);

const ProductModal = ({ product, dealerId, onClose, onSaved }) => {
    const isEdit = !!product?.id;
    const [form, setForm] = useState({
        name: 'Ежедневник', binding: product?.binding || [], spiralColors: product?.spiralColors || [],
        hasElastic: product?.hasElastic ?? false, elasticColors: product?.elasticColors || [],
        formats: product?.formats || [], coverColors: product?.coverColors || [],
        retailPrice: product?.retailPrice || '', wholesaleTiers: product?.wholesaleTiers || [],
    });
    const [spiralColor, setSpiralColor] = useState({ name: '', hex: '' });
    const [elasticColor, setElasticColor] = useState({ name: '', hex: '' });
    const [coverColor, setCoverColor] = useState({ name: '', hex: '' });
    const [tierInput, setTierInput] = useState({ minQty: '', pricePerUnit: '' });
    const [saving, setSaving] = useState(false);

    const toggleBinding = val => setForm(f => ({ ...f, binding: f.binding.includes(val) ? f.binding.filter(b => b !== val) : [...f.binding, val] }));
    const toggleFormat = val => setForm(f => ({ ...f, formats: f.formats.includes(val) ? f.formats.filter(x => x !== val) : [...f.formats, val] }));
    const addColor = (key, input, setInput) => {
        if (!input.hex) return;
        setForm(f => ({ ...f, [key]: [...f[key], { name: input.name || input.hex, hex: input.hex }] }));
        setInput({ name: '', hex: '' });
    };
    const removeColor = (key, idx) => setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));
    const addTier = () => {
        if (!tierInput.minQty || !tierInput.pricePerUnit) return;
        setForm(f => ({ ...f, wholesaleTiers: [...f.wholesaleTiers, { minQty: Number(tierInput.minQty), pricePerUnit: Number(tierInput.pricePerUnit) }].sort((a,b)=>a.minQty-b.minQty) }));
        setTierInput({ minQty: '', pricePerUnit: '' });
    };
    const handleSave = async () => {
        setSaving(true);
        try {
            const data = { ...form, dealerId, retailPrice: Number(form.retailPrice) || 0 };
            if (isEdit) { await updateProduct(product.id, data); } else { await saveProduct(data); }
            onSaved();
        } catch (err) { console.error(err); setSaving(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center
            bg-black/40 dark:bg-[#0B0F19]/60 backdrop-blur-sm p-0 md:p-6">
            <div className="relative w-full max-w-xl max-h-[92vh] rounded-t-[28px] md:rounded-[28px] overflow-hidden flex flex-col border shadow-2xl
                bg-white/95 border-black/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl
                dark:bg-[#0F1525]/90 dark:border-white/[0.08] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.07)_inset,_0_32px_80px_rgba(0,0,0,0.6)]">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/20 pointer-events-none z-10" />

                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 border-black/[0.05] dark:border-white/[0.05]">
                    <h3 className="font-mono text-[10px] uppercase tracking-widest text-[#1D1D1F]/60 dark:text-white/50">
                        {isEdit ? 'Редактировать продукт' : 'Добавить продукт'}
                    </h3>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full border flex items-center justify-center transition-all
                            border-black/[0.07] text-[#1D1D1F]/35 hover:border-black/[0.15] hover:text-[#1D1D1F]/70
                            dark:border-white/[0.08] dark:text-white/25 dark:hover:border-white/[0.2] dark:hover:text-white/60">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 custom-scrollbar">
                    <Section title="Продукт">
                        <div className="rounded-xl border px-4 py-2.5 text-sm font-medium border-black/[0.07] bg-black/[0.03] text-[#1D1D1F]/60 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/50">Ежедневник</div>
                    </Section>
                    <Section title="Переплёт">
                        <div className="flex flex-col gap-3">
                            <CheckToggle label="Твёрдый" checked={form.binding.includes('hard')} onChange={() => toggleBinding('hard')} />
                            <CheckToggle label="На пружине" checked={form.binding.includes('spiral')} onChange={() => toggleBinding('spiral')} />
                        </div>
                    </Section>
                    {form.binding.includes('spiral') && (
                        <Section title="Цвет пружины">
                            <div className="flex flex-wrap gap-2 mb-1">{form.spiralColors.map((c,i) => <ColorChip key={i} color={c} onRemove={() => removeColor('spiralColors',i)} />)}</div>
                            <ColorInput value={spiralColor} onChange={setSpiralColor} onAdd={() => addColor('spiralColors', spiralColor, setSpiralColor)} />
                        </Section>
                    )}
                    <Section title="Резинка">
                        <CheckToggle label="Есть резинка" checked={form.hasElastic} onChange={() => setForm(f => ({ ...f, hasElastic: !f.hasElastic }))} />
                    </Section>
                    {form.hasElastic && (
                        <Section title="Цвет резинки">
                            <div className="flex flex-wrap gap-2 mb-1">{form.elasticColors.map((c,i) => <ColorChip key={i} color={c} onRemove={() => removeColor('elasticColors',i)} />)}</div>
                            <ColorInput value={elasticColor} onChange={setElasticColor} onAdd={() => addColor('elasticColors', elasticColor, setElasticColor)} />
                        </Section>
                    )}
                    <Section title="Формат">
                        <div className="flex gap-6">
                            <CheckToggle label="A5" checked={form.formats.includes('A5')} onChange={() => toggleFormat('A5')} />
                            <CheckToggle label="A6" checked={form.formats.includes('A6')} onChange={() => toggleFormat('A6')} />
                        </div>
                    </Section>
                    <Section title="Цвет обложки">
                        <div className="flex flex-wrap gap-2 mb-1">{form.coverColors.map((c,i) => <ColorChip key={i} color={c} onRemove={() => removeColor('coverColors',i)} />)}</div>
                        <ColorInput value={coverColor} onChange={setCoverColor} onAdd={() => addColor('coverColors', coverColor, setCoverColor)} />
                    </Section>
                    <Section title="Цена">
                        <div className="mb-4">
                            <p className="font-mono text-[9px] uppercase tracking-widest text-[#1D1D1F]/30 dark:text-white/20 mb-2">Розница (BYN / шт)</p>
                            <input type="number" value={form.retailPrice} placeholder="1500" onChange={e => setForm(f => ({ ...f, retailPrice: e.target.value }))}
                                className="w-32 rounded-xl border px-4 py-2.5 text-sm outline-none transition-all
                                    bg-black/[0.03] border-black/[0.08] text-[#1D1D1F] placeholder:text-[#1D1D1F]/25
                                    focus:border-black/[0.2] dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white/80 dark:placeholder:text-white/15 dark:focus:border-white/20" />
                        </div>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-[#1D1D1F]/30 dark:text-white/20 mb-2">Оптовые уровни</p>
                        {form.wholesaleTiers.length > 0 && (
                            <div className="mb-3 space-y-2">
                                {form.wholesaleTiers.map((tier, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-2 border-black/[0.06] bg-black/[0.02] dark:border-white/[0.07] dark:bg-white/[0.02]">
                                        <span className="text-xs text-[#1D1D1F]/50 dark:text-white/35">от <span className="font-semibold text-[#1D1D1F] dark:text-white/80">{tier.minQty}</span> шт.</span>
                                        <span className="text-[#1D1D1F]/20 dark:text-white/15">→</span>
                                        <span className="text-xs font-semibold text-[#1D1D1F] dark:text-white/80">{tier.pricePerUnit} BYN/шт</span>
                                        <button onClick={() => setForm(f => ({ ...f, wholesaleTiers: f.wholesaleTiers.filter((_,j) => j!==i) }))} className="ml-auto text-[#1D1D1F]/25 dark:text-white/20 hover:text-red-500 transition-colors">×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            {[{ key:'minQty', ph:'От (шт)' }, { key:'pricePerUnit', ph:'BYN / шт' }].map(({ key, ph }) => (
                                <input key={key} type="number" value={tierInput[key]} placeholder={ph}
                                    onChange={e => setTierInput(t => ({ ...t, [key]: e.target.value }))}
                                    className="w-24 rounded-xl border px-3 py-2 text-sm outline-none transition-all
                                        bg-black/[0.03] border-black/[0.08] text-[#1D1D1F] placeholder:text-[#1D1D1F]/25
                                        focus:border-black/[0.2] dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white/80 dark:placeholder:text-white/15 dark:focus:border-white/20" />
                            ))}
                            <button onClick={addTier}
                                className="px-4 py-2 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap
                                    bg-black/[0.04] border-black/[0.08] text-[#1D1D1F]/60 hover:bg-black/[0.08]
                                    dark:bg-white/[0.06] dark:border-white/[0.1] dark:text-white/50 dark:hover:bg-white/[0.12]">
                                + Уровень
                            </button>
                        </div>
                    </Section>
                </div>

                <div className="flex gap-3 px-6 py-4 border-t shrink-0 border-black/[0.05] dark:border-white/[0.05]">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-widest transition-all
                            border-black/[0.08] text-[#1D1D1F]/55 bg-black/[0.03] hover:bg-black/[0.06]
                            dark:border-white/[0.09] dark:text-white/40 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]">
                        Отмена
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all
                            bg-[#1D1D1F] text-white hover:bg-black/85
                            dark:bg-white dark:text-[#0B0F19] dark:hover:bg-white/92
                            ${saving ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}>
                        {saving ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Добавить')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BINDING_LABELS = { hard: 'Твёрдый', spiral: 'На пружине' };

export const DealerDashboard = ({ onBack }) => {
    const { currentUser, logout } = useConfigurator();
    const [activeTab, setActiveTab] = useState('products');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        if (activeTab === 'orders') {
            setLoading(true);
            fetchAllOrders().then(data => { data.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds); setOrders(data); setLoading(false); });
        }
        if (activeTab === 'products' && currentUser) {
            setLoading(true);
            fetchDealerProducts(currentUser.id).then(data => { setProducts(data); setLoading(false); });
        }
    }, [activeTab, currentUser]);

    const handleSendToProduction = async id => {
        await updateOrderStatus(id, 'production');
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'production' } : o));
    };
    const handleDeleteProduct = async id => { await deleteProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); };
    const handleProductSaved = () => { setShowModal(false); setEditingProduct(null); if (currentUser) fetchDealerProducts(currentUser.id).then(setProducts); };

    const Spinner = () => (
        <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 rounded-full animate-spin border-black/[0.08] border-t-black/30 dark:border-white/10 dark:border-t-white/40" />
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#1D1D1F]/30 dark:text-white/25">Загрузка...</p>
        </div>
    );

    return (
        <div className="flex h-screen font-sans overflow-hidden transition-colors duration-500
            bg-[#F5F5F7] text-[#1D1D1F]
            dark:bg-[#0B0F19] dark:text-white">

            <div className="fixed inset-0 pointer-events-none dark:bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(91,155,255,0.07),transparent)]" />

            {showModal && (
                <ProductModal product={editingProduct} dealerId={currentUser?.id}
                    onClose={() => { setShowModal(false); setEditingProduct(null); }} onSaved={handleProductSaved} />
            )}

            {/* SIDEBAR */}
            <aside className="w-56 shrink-0 flex flex-col border-r z-20 relative
                border-black/[0.06] bg-[#EBEBED]/80 backdrop-blur-xl
                dark:border-white/[0.05] dark:bg-[#0D1220]/80 dark:backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/50 to-transparent dark:via-white/[0.04] pointer-events-none" />
                <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center
                            bg-[#1D1D1F] dark:bg-white/[0.08] dark:border dark:border-white/[0.12]">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                className="text-white dark:text-white/80"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                        </div>
                        <span className="font-semibold text-sm text-[#1D1D1F] dark:text-white">Spruzhyk</span>
                    </div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#1D1D1F]/35 dark:text-white/25">Дилер</p>
                    <p className="text-xs text-[#1D1D1F]/40 dark:text-white/30 mt-0.5 truncate">{currentUser?.email}</p>
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    {[{ id: 'products', label: 'Мои продукты' }, { id: 'orders', label: 'Заказы' }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full px-3 py-2.5 rounded-xl text-left font-mono text-[9px] uppercase tracking-widest transition-all
                                ${activeTab === tab.id
                                    ? 'bg-black/[0.07] text-[#1D1D1F] dark:bg-white/[0.1] dark:text-white'
                                    : 'text-[#1D1D1F]/35 dark:text-white/25 hover:bg-black/[0.04] hover:text-[#1D1D1F]/65 dark:hover:bg-white/[0.05] dark:hover:text-white/60'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-black/[0.05] dark:border-white/[0.04]">
                    <button onClick={() => { logout(); onBack(); }}
                        className="w-full py-2.5 px-3 rounded-xl font-mono text-[9px] uppercase tracking-widest transition-all text-left
                            text-[#1D1D1F]/30 dark:text-white/20 hover:bg-black/[0.04] hover:text-red-500 dark:hover:bg-white/[0.04] dark:hover:text-red-400">
                        Выйти
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">

                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">Мои продукты</h2>
                                <p className="font-mono text-[9px] uppercase tracking-widest text-[#1D1D1F]/30 dark:text-white/25 mt-1.5">Каталог и настройки позиций</p>
                            </div>
                            <button onClick={() => { setEditingProduct(null); setShowModal(true); }}
                                className="h-9 px-5 rounded-full text-xs font-semibold transition-all active:scale-95
                                    bg-[#1D1D1F] text-white hover:bg-black/85
                                    dark:bg-white dark:text-[#0B0F19] dark:hover:bg-white/92">
                                + Добавить
                            </button>
                        </div>

                        {loading ? <Spinner /> : products.length === 0 ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <div className="w-14 h-14 rounded-full border flex items-center justify-center border-black/[0.07] bg-black/[0.03] dark:border-white/[0.08] dark:bg-white/[0.03]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#1D1D1F]/30 dark:text-white/20"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                                </div>
                                <p className="font-mono text-[9px] uppercase tracking-widest text-[#1D1D1F]/30 dark:text-white/20">Нет продуктов</p>
                                <button onClick={() => { setEditingProduct(null); setShowModal(true); }}
                                    className="h-8 px-5 rounded-full text-xs font-semibold bg-[#1D1D1F] text-white hover:bg-black/85 dark:bg-white dark:text-[#0B0F19] active:scale-95 transition-all">
                                    + Добавить первый
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {products.map(prod => (
                                    <div key={prod.id}
                                        className="relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-500 p-5
                                            bg-white/80 border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm
                                            dark:bg-white/[0.04] dark:border-white/[0.07] dark:hover:bg-white/[0.07] dark:backdrop-blur-xl">
                                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/15 pointer-events-none" />
                                        <div className="aspect-video bg-[#F0F0F2] dark:bg-white/[0.03] rounded-xl mb-4 border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-center">
                                            <svg width="24" height="34" viewBox="0 0 100 130" fill="none" className="opacity-20">
                                                <rect x="20" y="10" width="62" height="110" rx="3" fill="currentColor"/>
                                                <path d="M78 12 V118 L84 116 V14 Z" fill="#5B9BFF"/>
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-white/90 mb-2">{prod.name}</h3>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {prod.formats?.map(f => (
                                                <span key={f} className="px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-wider border bg-black/[0.04] text-[#1D1D1F]/50 border-black/[0.06] dark:bg-white/[0.05] dark:text-white/30 dark:border-white/[0.08]">{f}</span>
                                            ))}
                                            {prod.binding?.map(b => (
                                                <span key={b} className="px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-wider border bg-blue-50 text-blue-500 border-blue-100 dark:bg-blue-500/[0.1] dark:text-blue-400/70 dark:border-blue-500/[0.15]">{BINDING_LABELS[b] || b}</span>
                                            ))}
                                        </div>
                                        {prod.coverColors?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {prod.coverColors.slice(0,10).map((c,i) => (
                                                    <div key={i} title={c.name} className="w-3.5 h-3.5 rounded-full border border-black/[0.12] dark:border-white/[0.15]" style={{ backgroundColor: c.hex }} />
                                                ))}
                                                {prod.coverColors.length > 10 && <span className="font-mono text-[9px] text-[#1D1D1F]/30 dark:text-white/20 self-center">+{prod.coverColors.length - 10}</span>}
                                            </div>
                                        )}
                                        <div className="mt-auto pt-4 border-t border-black/[0.05] dark:border-white/[0.04] flex items-center justify-between gap-2">
                                            <span className="font-semibold text-sm text-[#1D1D1F] dark:text-white/90">{prod.retailPrice} BYN</span>
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={() => { setEditingProduct(prod); setShowModal(true); }}
                                                    className="h-7 px-3 rounded-full border font-mono text-[8px] uppercase tracking-wider transition-all
                                                        border-black/[0.08] text-[#1D1D1F]/45 hover:border-black/[0.18] hover:text-[#1D1D1F]/80
                                                        dark:border-white/[0.08] dark:text-white/25 dark:hover:border-white/[0.2] dark:hover:text-white/60">Изменить</button>
                                                <button onClick={() => handleDeleteProduct(prod.id)}
                                                    className="h-7 px-3 rounded-full border font-mono text-[8px] uppercase tracking-wider transition-all
                                                        border-red-200 text-red-400/70 bg-red-50/60 hover:bg-red-50
                                                        dark:border-red-500/[0.15] dark:text-red-400/50 dark:bg-red-500/[0.05] dark:hover:bg-red-500/[0.12]">Удалить</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">Управление заказами</h2>
                                <p className="font-mono text-[9px] uppercase tracking-widest text-[#1D1D1F]/30 dark:text-white/25 mt-1.5">Все входящие заявки от клиентов</p>
                            </div>
                            <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5 border border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/[0.05]">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                                <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live</span>
                            </div>
                        </div>

                        <div className="relative rounded-2xl border overflow-hidden
                            bg-white/80 border-black/[0.05] shadow-[0_2px_24px_rgba(0,0,0,0.05)] backdrop-blur-sm
                            dark:bg-white/[0.03] dark:border-white/[0.06] dark:backdrop-blur-xl
                            dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.04)_inset]">
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/15 pointer-events-none" />
                            {loading ? <Spinner /> : orders.length === 0 ? (
                                <div className="py-20 flex flex-col items-center gap-3">
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#1D1D1F]/25 dark:text-white/20">Нет заказов</p>
                                </div>
                            ) : (
                                orders.map((order, i) => (
                                    <div key={order.id}
                                        className={`px-6 py-4 grid grid-cols-[80px_1fr_1fr_1fr_auto] gap-4 items-center transition-colors
                                            hover:bg-black/[0.02] dark:hover:bg-white/[0.02]
                                            ${i !== orders.length-1 ? 'border-b border-black/[0.04] dark:border-white/[0.04]' : ''}`}>
                                        <div>
                                            <p className="font-semibold text-sm text-[#1D1D1F] dark:text-white/90">#{order.id.substring(0,6).toUpperCase()}</p>
                                            <p className="font-mono text-[9px] uppercase tracking-wider text-[#1D1D1F]/30 dark:text-white/25 mt-0.5">{order.date}</p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm text-[#1D1D1F] dark:text-white/90 truncate">{order.userEmail}</p>
                                            <p className="font-mono text-[9px] uppercase tracking-wider text-[#1D1D1F]/30 dark:text-white/25">{order.role}</p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm text-[#1D1D1F] dark:text-white/90 truncate">{order.product}</p>
                                            <p className="text-xs text-[#1D1D1F]/40 dark:text-white/30 truncate">{order.design}</p>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-sm text-[#1D1D1F] dark:text-white/90">{order.price} BYN</span>
                                        </div>
                                        <div className="flex justify-end">
                                            {order.status === 'new' ? (
                                                <button onClick={() => handleSendToProduction(order.id)}
                                                    className="h-8 px-4 rounded-full border text-[10px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap active:scale-95
                                                        bg-[#1D1D1F] border-[#1D1D1F] text-white hover:bg-black/85
                                                        dark:bg-white dark:border-white dark:text-[#0B0F19] dark:hover:bg-white/92">
                                                    В производство →
                                                </button>
                                            ) : <StatusBadge status={order.status} />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
