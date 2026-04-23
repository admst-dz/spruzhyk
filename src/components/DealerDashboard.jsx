import { useState, useEffect } from 'react';
import { useConfigurator } from "../store";
import { fetchAllOrders, updateOrderStatus, fetchDealerProducts, saveProduct, updateProduct, deleteProduct } from '../api';

const statusConfig = {
    new:        { text: 'Новый',          cls: 'bg-paper-100 text-paper-500 border-paper-300 dark:bg-white/5 dark:text-white/30 dark:border-white/10' },
    production: { text: 'В производстве', cls: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' },
    processing: { text: 'В обработке',    cls: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
    in_delivery:{ text: 'Доставляется',   cls: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' },
    done:       { text: 'Готово',         cls: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
};

const StatusBadge = ({ status }) => {
    const s = statusConfig[status] || { text: status, cls: 'bg-paper-100 text-paper-500 border-paper-300 dark:bg-white/5 dark:text-white/30 dark:border-white/10' };
    return (
        <span className={`px-3 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider border ${s.cls}`}>
            {s.text}
        </span>
    );
};

const CheckToggle = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
        <div
            onClick={onChange}
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                checked
                    ? 'bg-ink-900 border-ink-900 dark:bg-[#C9A96E] dark:border-[#C9A96E]'
                    : 'border-paper-300 bg-paper-100 group-hover:border-paper-500 dark:bg-white/5 dark:border-white/20 dark:group-hover:border-white/40'
            }`}
        >
            {checked && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
        </div>
        <span className="text-sm text-ink-800 dark:text-white/60 group-hover:text-ink-900 dark:group-hover:text-white/80 transition-colors">{label}</span>
    </label>
);

const ColorChip = ({ color, onRemove }) => (
    <div className="flex items-center gap-2 rounded-full px-3 py-1.5 border
        bg-paper-100 border-paper-200 dark:bg-white/5 dark:border-white/10">
        <div className="w-3 h-3 rounded-full border border-paper-300 dark:border-white/20 shrink-0" style={{ backgroundColor: color.hex }} />
        <span className="font-mono text-[9px] text-ink-700 dark:text-white/50">{color.name}</span>
        {onRemove && (
            <button onClick={onRemove} className="text-paper-400 dark:text-white/20 hover:text-red-500 transition-colors leading-none ml-0.5">×</button>
        )}
    </div>
);

const ColorInput = ({ value, onChange, onAdd }) => (
    <div className="flex gap-2 mt-2">
        <input
            type="color"
            value={value.hex || '#ffffff'}
            onChange={(e) => onChange({ ...value, hex: e.target.value })}
            className="w-9 h-9 rounded-lg border border-paper-200 dark:border-white/10 bg-transparent cursor-pointer p-0.5 shrink-0"
        />
        <input
            type="text" placeholder="#ff0000" value={value.hex}
            onChange={(e) => onChange({ ...value, hex: e.target.value })}
            className="w-24 rounded-xl border px-3 py-2 text-sm outline-none transition-all
                bg-paper-100 border-paper-200 text-ink-900 placeholder:text-paper-300
                focus:border-paper-400 focus:bg-white
                dark:bg-white/[0.04] dark:border-white/8 dark:text-white/80 dark:placeholder:text-white/15 dark:focus:border-white/20"
        />
        <input
            type="text" placeholder="Название" value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition-all
                bg-paper-100 border-paper-200 text-ink-900 placeholder:text-paper-300
                focus:border-paper-400 focus:bg-white
                dark:bg-white/[0.04] dark:border-white/8 dark:text-white/80 dark:placeholder:text-white/15 dark:focus:border-white/20"
        />
        <button
            onClick={onAdd} disabled={!value.hex}
            className="px-3 py-2 rounded-xl border text-sm font-bold transition-all
                bg-paper-200 border-paper-300 text-ink-800 hover:bg-paper-300
                dark:bg-white/8 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/15
                disabled:opacity-30"
        >+</button>
    </div>
);

const Section = ({ title, children }) => (
    <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-paper-400 dark:text-white/25 mb-3">{title}</p>
        {children}
    </div>
);

const ProductModal = ({ product, dealerId, onClose, onSaved }) => {
    const isEdit = !!product?.id;

    const [form, setForm] = useState({
        name: 'Ежедневник',
        binding: product?.binding || [],
        spiralColors: product?.spiralColors || [],
        hasElastic: product?.hasElastic ?? false,
        elasticColors: product?.elasticColors || [],
        formats: product?.formats || [],
        coverColors: product?.coverColors || [],
        retailPrice: product?.retailPrice || '',
        wholesaleTiers: product?.wholesaleTiers || [],
    });

    const [spiralColor, setSpiralColor] = useState({ name: '', hex: '' });
    const [elasticColor, setElasticColor] = useState({ name: '', hex: '' });
    const [coverColor, setCoverColor] = useState({ name: '', hex: '' });
    const [tierInput, setTierInput] = useState({ minQty: '', pricePerUnit: '' });
    const [saving, setSaving] = useState(false);

    const toggleBinding = (val) =>
        setForm(f => ({ ...f, binding: f.binding.includes(val) ? f.binding.filter(b => b !== val) : [...f.binding, val] }));

    const toggleFormat = (val) =>
        setForm(f => ({ ...f, formats: f.formats.includes(val) ? f.formats.filter(x => x !== val) : [...f.formats, val] }));

    const addColor = (key, input, setInput) => {
        if (!input.hex) return;
        setForm(f => ({ ...f, [key]: [...f[key], { name: input.name || input.hex, hex: input.hex }] }));
        setInput({ name: '', hex: '' });
    };

    const removeColor = (key, idx) =>
        setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

    const addTier = () => {
        if (!tierInput.minQty || !tierInput.pricePerUnit) return;
        setForm(f => ({
            ...f,
            wholesaleTiers: [...f.wholesaleTiers, { minQty: Number(tierInput.minQty), pricePerUnit: Number(tierInput.pricePerUnit) }]
                .sort((a, b) => a.minQty - b.minQty),
        }));
        setTierInput({ minQty: '', pricePerUnit: '' });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = { ...form, dealerId, retailPrice: Number(form.retailPrice) || 0 };
            if (isEdit) { await updateProduct(product.id, data); }
            else { await saveProduct(data); }
            onSaved();
        } catch (err) {
            console.error(err);
            setSaving(false);
        }
    };

    const hasSpiralBinding = form.binding.includes('spiral');

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center
            bg-ink-900/50 dark:bg-[#0C0B09]/70 backdrop-blur-sm p-0 md:p-6">
            <div className="w-full max-w-xl max-h-[92vh] border rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col shadow-2xl
                bg-paper-50 border-paper-200 shadow-ink-900/10
                dark:bg-[#13110E] dark:border-white/[0.07] dark:shadow-black/70">

                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0
                    border-paper-100 dark:border-white/[0.04]">
                    <h3 className="font-mono text-[10px] uppercase tracking-widest text-ink-800 dark:text-white/60">
                        {isEdit ? 'Редактировать продукт' : 'Добавить продукт'}
                    </h3>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full border flex items-center justify-center transition-all
                            border-paper-200 text-paper-400 hover:border-paper-400 hover:text-ink-700
                            dark:border-white/8 dark:text-white/30 dark:hover:border-white/20 dark:hover:text-white/60">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">

                    <Section title="Продукт">
                        <div className="rounded-xl border px-4 py-3 text-sm font-bold
                            border-paper-200 bg-paper-100 text-ink-800
                            dark:border-white/8 dark:bg-white/[0.03] dark:text-white/60">
                            Ежедневник
                        </div>
                    </Section>

                    <Section title="Переплёт">
                        <div className="flex flex-col gap-3">
                            <CheckToggle label="Твёрдый" checked={form.binding.includes('hard')} onChange={() => toggleBinding('hard')} />
                            <CheckToggle label="На пружине" checked={form.binding.includes('spiral')} onChange={() => toggleBinding('spiral')} />
                        </div>
                    </Section>

                    {hasSpiralBinding && (
                        <Section title="Цвет пружины">
                            <div className="flex flex-wrap gap-2 mb-1">
                                {form.spiralColors.map((c, i) => (
                                    <ColorChip key={i} color={c} onRemove={() => removeColor('spiralColors', i)} />
                                ))}
                            </div>
                            <ColorInput value={spiralColor} onChange={setSpiralColor} onAdd={() => addColor('spiralColors', spiralColor, setSpiralColor)} />
                        </Section>
                    )}

                    <Section title="Резинка">
                        <CheckToggle label="Есть резинка" checked={form.hasElastic} onChange={() => setForm(f => ({ ...f, hasElastic: !f.hasElastic }))} />
                    </Section>

                    {form.hasElastic && (
                        <Section title="Цвет резинки">
                            <div className="flex flex-wrap gap-2 mb-1">
                                {form.elasticColors.map((c, i) => (
                                    <ColorChip key={i} color={c} onRemove={() => removeColor('elasticColors', i)} />
                                ))}
                            </div>
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
                        <div className="flex flex-wrap gap-2 mb-1">
                            {form.coverColors.map((c, i) => (
                                <ColorChip key={i} color={c} onRemove={() => removeColor('coverColors', i)} />
                            ))}
                        </div>
                        <ColorInput value={coverColor} onChange={setCoverColor} onAdd={() => addColor('coverColors', coverColor, setCoverColor)} />
                    </Section>

                    <Section title="Цена">
                        <div className="mb-4">
                            <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/20 mb-2">Розница (BYN / шт)</p>
                            <input
                                type="number" value={form.retailPrice} placeholder="1500"
                                onChange={(e) => setForm(f => ({ ...f, retailPrice: e.target.value }))}
                                className="w-32 rounded-xl border px-4 py-2.5 text-sm outline-none transition-all
                                    bg-paper-100 border-paper-200 text-ink-900 placeholder:text-paper-300
                                    focus:border-paper-400 focus:bg-white
                                    dark:bg-white/[0.04] dark:border-white/8 dark:text-white/80 dark:placeholder:text-white/15 dark:focus:border-white/20"
                            />
                        </div>

                        <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/20 mb-2">Оптовые уровни</p>
                        {form.wholesaleTiers.length > 0 && (
                            <div className="mb-3 space-y-2">
                                {form.wholesaleTiers.map((tier, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-2.5
                                        bg-paper-100 border-paper-200 dark:bg-white/[0.03] dark:border-white/8">
                                        <span className="text-xs text-paper-500 dark:text-white/40">от <span className="font-bold text-ink-900 dark:text-white/80">{tier.minQty}</span> шт.</span>
                                        <span className="text-paper-300 dark:text-white/15">→</span>
                                        <span className="text-xs font-bold text-ink-900 dark:text-white/80">{tier.pricePerUnit} BYN/шт</span>
                                        <button
                                            onClick={() => setForm(f => ({ ...f, wholesaleTiers: f.wholesaleTiers.filter((_, j) => j !== i) }))}
                                            className="ml-auto text-paper-400 dark:text-white/20 hover:text-red-500 transition-colors">×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input type="number" value={tierInput.minQty} placeholder="От (шт)"
                                onChange={(e) => setTierInput(t => ({ ...t, minQty: e.target.value }))}
                                className="w-24 rounded-xl border px-3 py-2 text-sm outline-none transition-all
                                    bg-paper-100 border-paper-200 text-ink-900 placeholder:text-paper-300
                                    focus:border-paper-400 focus:bg-white
                                    dark:bg-white/[0.04] dark:border-white/8 dark:text-white/80 dark:placeholder:text-white/15 dark:focus:border-white/20"
                            />
                            <input type="number" value={tierInput.pricePerUnit} placeholder="BYN / шт"
                                onChange={(e) => setTierInput(t => ({ ...t, pricePerUnit: e.target.value }))}
                                className="w-24 rounded-xl border px-3 py-2 text-sm outline-none transition-all
                                    bg-paper-100 border-paper-200 text-ink-900 placeholder:text-paper-300
                                    focus:border-paper-400 focus:bg-white
                                    dark:bg-white/[0.04] dark:border-white/8 dark:text-white/80 dark:placeholder:text-white/15 dark:focus:border-white/20"
                            />
                            <button onClick={addTier}
                                className="px-4 py-2 rounded-xl border text-xs font-bold transition-all whitespace-nowrap
                                    bg-paper-200 border-paper-300 text-ink-800 hover:bg-paper-300
                                    dark:bg-white/8 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/15">
                                + Уровень
                            </button>
                        </div>
                    </Section>
                </div>

                <div className="flex gap-3 px-6 py-4 border-t shrink-0 border-paper-100 dark:border-white/[0.04]">
                    <button onClick={onClose}
                        className="flex-1 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all
                            border-paper-300 text-ink-700 bg-paper-100 hover:bg-paper-200
                            dark:border-white/10 dark:text-white/40 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]">
                        Отмена
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                            bg-ink-900 text-white hover:bg-ink-800
                            dark:bg-transparent dark:border dark:border-[#C9A96E]/50 dark:text-[#C9A96E] dark:hover:bg-[#C9A96E]/10
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
            fetchAllOrders().then(data => {
                data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                setOrders(data);
                setLoading(false);
            });
        }
        if (activeTab === 'products' && currentUser) {
            setLoading(true);
            fetchDealerProducts(currentUser.id).then(data => {
                setProducts(data);
                setLoading(false);
            });
        }
    }, [activeTab, currentUser]);

    const handleSendToProduction = async (orderId) => {
        await updateOrderStatus(orderId, 'production');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'production' } : o));
    };

    const handleDeleteProduct = async (productId) => {
        await deleteProduct(productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const handleProductSaved = () => {
        setShowModal(false);
        setEditingProduct(null);
        if (currentUser) { fetchDealerProducts(currentUser.id).then(setProducts); }
    };

    const openAdd = () => { setEditingProduct(null); setShowModal(true); };
    const openEdit = (p) => { setEditingProduct(p); setShowModal(true); };

    return (
        <div className="flex h-screen font-sans overflow-hidden transition-colors duration-500
            bg-paper-100 text-ink-900
            dark:bg-[#0C0B09] dark:text-[#F0EBE1]">

            {showModal && (
                <ProductModal
                    product={editingProduct}
                    dealerId={currentUser?.id}
                    onClose={() => { setShowModal(false); setEditingProduct(null); }}
                    onSaved={handleProductSaved}
                />
            )}

            {/* SIDEBAR */}
            <aside className="w-56 shrink-0 flex flex-col border-r z-20
                border-paper-200 bg-paper-50
                dark:border-white/[0.05] dark:bg-[#0F0D0B]">
                <div className="p-5 border-b border-paper-100 dark:border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 border rounded-lg flex items-center justify-center
                            border-paper-300 dark:border-[#C9A96E]/30">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round"
                                className="text-paper-500 dark:text-[#C9A96E]">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <span className="font-display text-sm font-600 tracking-wide text-ink-900 dark:text-[#F0EBE1]">Spruzhyk</span>
                    </div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-[#C9A96E]/50">Дилер</p>
                    <p className="text-xs text-paper-500 dark:text-white/35 mt-0.5 truncate">{currentUser?.email}</p>
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    {[
                        { id: 'products', label: 'Мои продукты' },
                        { id: 'orders',   label: 'Заказы' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left
                                font-mono text-[9px] uppercase tracking-widest
                                ${activeTab === tab.id
                                    ? 'bg-paper-200 text-ink-900 dark:bg-white/8 dark:text-white/80'
                                    : 'text-paper-400 dark:text-white/25 hover:bg-paper-100 hover:text-ink-700 dark:hover:bg-white/[0.04] dark:hover:text-white/50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-paper-100 dark:border-white/[0.04]">
                    <button
                        onClick={() => { logout(); onBack(); }}
                        className="w-full py-2.5 px-3 rounded-xl font-mono text-[9px] uppercase tracking-widest transition-all text-left
                            text-paper-400 dark:text-white/20 hover:bg-paper-100 hover:text-red-500 dark:hover:bg-white/[0.04] dark:hover:text-red-400"
                    >
                        Выйти
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 overflow-y-auto p-8">

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="font-display text-3xl font-300 text-ink-900 dark:text-[#F0EBE1]">Мои продукты</h2>
                                <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/25 mt-1">
                                    Каталог и настройки позиций
                                </p>
                            </div>
                            <button
                                onClick={openAdd}
                                className="h-9 px-5 rounded-full border text-xs font-bold transition-all
                                    border-ink-900 bg-ink-900 text-white hover:bg-ink-800
                                    dark:border-[#C9A96E]/50 dark:bg-transparent dark:text-[#C9A96E] dark:hover:bg-[#C9A96E]/10
                                    active:scale-95"
                            >
                                + Добавить продукт
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center gap-3">
                                <div className="w-5 h-5 border-2 rounded-full animate-spin
                                    border-paper-200 border-t-paper-500 dark:border-white/10 dark:border-t-white/40" />
                                <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/25">Загрузка...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <div className="w-14 h-14 border rounded-full flex items-center justify-center
                                    border-paper-200 bg-paper-100 dark:border-white/8 dark:bg-white/[0.03]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                        className="text-paper-400 dark:text-white/20"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                                </div>
                                <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/20">Нет продуктов</p>
                                <button onClick={openAdd}
                                    className="h-9 px-5 rounded-full border text-xs font-bold transition-all
                                        border-ink-900 bg-ink-900 text-white hover:bg-ink-800
                                        dark:border-[#C9A96E]/50 dark:bg-transparent dark:text-[#C9A96E] dark:hover:bg-[#C9A96E]/10 active:scale-95">
                                    + Добавить первый
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {products.map(prod => (
                                    <div key={prod.id}
                                        className="group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-500 p-5
                                            bg-white border-paper-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-paper-300
                                            dark:bg-white/[0.03] dark:border-white/[0.06] dark:hover:bg-white/[0.06] dark:hover:border-white/[0.12]">

                                        <div className="aspect-video bg-paper-100 dark:bg-white/[0.03] rounded-xl mb-4 border border-paper-100 dark:border-white/[0.04] flex items-center justify-center">
                                            <svg width="28" height="40" viewBox="0 0 100 130" fill="none" className="opacity-20">
                                                <rect x="20" y="10" width="62" height="110" rx="3" fill="currentColor"/>
                                                <path d="M78 12 V118 L84 116 V14 Z" fill="#C9A96E"/>
                                            </svg>
                                        </div>

                                        <h3 className="font-bold text-sm text-ink-900 dark:text-white/90 mb-2">{prod.name}</h3>

                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {prod.formats?.map(f => (
                                                <span key={f} className="px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-wider
                                                    bg-paper-100 text-paper-500 border border-paper-200
                                                    dark:bg-white/[0.04] dark:text-white/30 dark:border-white/8">{f}</span>
                                            ))}
                                            {prod.binding?.map(b => (
                                                <span key={b} className="px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-wider
                                                    bg-blue-50 text-blue-500 border border-blue-100
                                                    dark:bg-blue-500/8 dark:text-blue-400/70 dark:border-blue-500/15">{BINDING_LABELS[b] || b}</span>
                                            ))}
                                            {prod.hasElastic && (
                                                <span className="px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-wider
                                                    bg-emerald-50 text-emerald-500 border border-emerald-100
                                                    dark:bg-emerald-500/8 dark:text-emerald-400/70 dark:border-emerald-500/15">Резинка</span>
                                            )}
                                        </div>

                                        {prod.coverColors?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {prod.coverColors.slice(0, 10).map((c, i) => (
                                                    <div key={i} title={c.name} className="w-3.5 h-3.5 rounded-full border border-paper-200 dark:border-white/15"
                                                        style={{ backgroundColor: c.hex }} />
                                                ))}
                                                {prod.coverColors.length > 10 && (
                                                    <span className="font-mono text-[9px] text-paper-400 dark:text-white/20 self-center">
                                                        +{prod.coverColors.length - 10}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-auto pt-4 border-t border-paper-100 dark:border-white/[0.04] flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <span className="font-bold text-ink-900 dark:text-white/90 text-sm">{prod.retailPrice} BYN</span>
                                                {prod.wholesaleTiers?.length > 0 && (
                                                    <span className="font-mono text-[9px] text-paper-400 dark:text-white/20 ml-1.5">
                                                        / опт {prod.wholesaleTiers[0].pricePerUnit} BYN
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={() => openEdit(prod)}
                                                    className="h-7 px-3 rounded-full border font-mono text-[8px] uppercase tracking-wider transition-all
                                                        border-paper-200 text-paper-500 hover:border-paper-400 hover:text-ink-700
                                                        dark:border-white/8 dark:text-white/25 dark:hover:border-white/20 dark:hover:text-white/60">
                                                    Изменить
                                                </button>
                                                <button onClick={() => handleDeleteProduct(prod.id)}
                                                    className="h-7 px-3 rounded-full border font-mono text-[8px] uppercase tracking-wider transition-all
                                                        border-red-200 text-red-400 bg-red-50 hover:bg-red-100
                                                        dark:border-red-500/15 dark:text-red-400/60 dark:bg-red-500/5 dark:hover:bg-red-500/10">
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div>
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="font-display text-3xl font-300 text-ink-900 dark:text-[#F0EBE1]">Управление заказами</h2>
                                <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/25 mt-1">
                                    Все входящие заявки от клиентов
                                </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-full px-4 py-2 border
                                border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
                                <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live</span>
                            </div>
                        </div>

                        <div className="rounded-2xl border overflow-hidden
                            bg-white border-paper-200 shadow-[0_2px_24px_rgba(0,0,0,0.05)]
                            dark:bg-white/[0.02] dark:border-white/[0.06]">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center gap-3">
                                    <div className="w-5 h-5 border-2 rounded-full animate-spin
                                        border-paper-200 border-t-paper-500 dark:border-white/10 dark:border-t-white/40" />
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/25">Загрузка...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="py-20 flex flex-col items-center gap-4">
                                    <div className="w-14 h-14 border rounded-full flex items-center justify-center
                                        border-paper-200 bg-paper-100 dark:border-white/8 dark:bg-white/[0.03]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                            className="text-paper-400 dark:text-white/20"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.18 9.8 19.79 19.79 0 01.1 1.18 2 2 0 012.07 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.12 6.12l1.27-.87a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121 15.19z"/></svg>
                                    </div>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/20">Нет заказов</p>
                                </div>
                            ) : (
                                orders.map((order, i) => (
                                    <div
                                        key={order.id}
                                        className={`px-6 py-4 grid grid-cols-[80px_1fr_1fr_1fr_auto] gap-4 items-center transition-colors
                                            hover:bg-paper-50 dark:hover:bg-white/[0.02]
                                            ${i !== orders.length - 1 ? 'border-b border-paper-100 dark:border-white/[0.04]' : ''}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-ink-900 dark:text-white/90">
                                                #{order.id.substring(0, 6).toUpperCase()}
                                            </span>
                                            <span className="font-mono text-[9px] uppercase tracking-wider text-paper-400 dark:text-white/25 mt-0.5">
                                                {order.date}
                                            </span>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-sm text-ink-900 dark:text-white/90 truncate">{order.userEmail}</span>
                                            <span className="font-mono text-[9px] uppercase tracking-wider text-paper-400 dark:text-white/25 mt-0.5">{order.role}</span>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-sm text-ink-900 dark:text-white/90 truncate">{order.product}</span>
                                            <span className="text-xs text-paper-500 dark:text-white/35 truncate">{order.design}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold text-ink-900 dark:text-white/90 text-sm">{order.price} BYN</span>
                                        </div>
                                        <div className="flex justify-end">
                                            {order.status === 'new' ? (
                                                <button
                                                    onClick={() => handleSendToProduction(order.id)}
                                                    className="h-8 px-4 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap
                                                        border-ink-900 bg-ink-900 text-white hover:bg-ink-800
                                                        dark:border-[#C9A96E]/50 dark:bg-transparent dark:text-[#C9A96E] dark:hover:bg-[#C9A96E]/10 active:scale-95"
                                                >
                                                    В производство →
                                                </button>
                                            ) : (
                                                <StatusBadge status={order.status} />
                                            )}
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
