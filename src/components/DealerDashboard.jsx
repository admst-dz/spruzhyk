import { useState, useEffect } from 'react';
import { useConfigurator } from "../store";
import { fetchAllOrders, updateOrderStatus, fetchDealerProducts, saveProduct, updateProduct, deleteProduct } from '../firebase';

const statusConfig = {
    new:        { text: 'Новый',          color: 'bg-white/10 text-gray-400 border-white/10' },
    production: { text: 'В производстве', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    processing: { text: 'В обработке',    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    in_delivery:{ text: 'Доставляется',   color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    done:       { text: 'Готово',         color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
};

const StatusBadge = ({ status }) => {
    const s = statusConfig[status] || { text: status, color: 'bg-white/10 text-gray-400 border-white/10' };
    return (
        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.color}`}>
            {s.text}
        </span>
    );
};

// ─── Product Modal sub-components ────────────────────────────────────────────

const CheckToggle = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
        <div
            onClick={onChange}
            className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all shrink-0 ${
                checked ? 'bg-white border-white' : 'bg-white/5 border-white/20 group-hover:border-white/40'
            }`}
        >
            {checked && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#0B0F19" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
        </div>
        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{label}</span>
    </label>
);

const ColorChip = ({ color, onRemove }) => (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
        <div className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: color.hex }} />
        <span className="text-xs text-gray-300">{color.name}</span>
        {onRemove && (
            <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors text-sm leading-none ml-0.5">×</button>
        )}
    </div>
);

const ColorInput = ({ value, onChange, onAdd }) => (
    <div className="flex gap-2 mt-2 pointer-events-auto">
        <input
            type="color"
            value={value.hex || '#ffffff'}
            onChange={(e) => onChange({ ...value, hex: e.target.value })}
            className="w-10 h-10 rounded-[10px] border border-white/10 bg-transparent cursor-pointer p-0.5 shrink-0"
        />
        <input
            type="text"
            placeholder="#ff0000"
            value={value.hex}
            onChange={(e) => onChange({ ...value, hex: e.target.value })}
            className="w-28 bg-black/20 border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30"
        />
        <input
            type="text"
            placeholder="Название"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            className="flex-1 bg-black/20 border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30"
        />
        <button
            onClick={onAdd}
            disabled={!value.hex}
            className="px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-[12px] transition-all disabled:opacity-30"
        >
            +
        </button>
    </div>
);

const Section = ({ title, children }) => (
    <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">{title}</p>
        {children}
    </div>
);

// ─── ProductModal ─────────────────────────────────────────────────────────────

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
            const data = {
                ...form,
                dealerId,
                retailPrice: Number(form.retailPrice) || 0,
            };
            if (isEdit) {
                await updateProduct(product.id, data);
            } else {
                await saveProduct(data);
            }
            onSaved();
        } catch (err) {
            console.error(err);
            setSaving(false);
        }
    };

    const hasSpiralBinding = form.binding.includes('spiral');

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-6">
            <div className="w-full max-w-2xl max-h-[92vh] bg-[#0F1525] border border-white/10 rounded-t-[32px] md:rounded-[32px] overflow-hidden flex flex-col shadow-[0_20px_80px_rgba(0,0,0,0.8)]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                    <h3 className="font-bold text-white uppercase tracking-widest text-sm">
                        {isEdit ? 'Редактировать продукт' : 'Добавить продукт'}
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 py-6 space-y-7">

                    {/* Product type */}
                    <Section title="Продукт">
                        <div className="bg-white/5 border border-white/10 rounded-[14px] px-4 py-3 text-white font-bold text-sm">
                            Ежедневник
                        </div>
                    </Section>

                    {/* Binding */}
                    <Section title="Переплёт">
                        <div className="flex flex-col gap-3">
                            <CheckToggle label="Твёрдый" checked={form.binding.includes('hard')} onChange={() => toggleBinding('hard')} />
                            <CheckToggle label="На пружине" checked={form.binding.includes('spiral')} onChange={() => toggleBinding('spiral')} />
                        </div>
                    </Section>

                    {/* Spiral colors */}
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

                    {/* Elastic */}
                    <Section title="Резинка">
                        <CheckToggle label="Есть резинка" checked={form.hasElastic} onChange={() => setForm(f => ({ ...f, hasElastic: !f.hasElastic }))} />
                    </Section>

                    {/* Elastic colors */}
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

                    {/* Format */}
                    <Section title="Формат">
                        <div className="flex gap-6">
                            <CheckToggle label="A5" checked={form.formats.includes('A5')} onChange={() => toggleFormat('A5')} />
                            <CheckToggle label="A6" checked={form.formats.includes('A6')} onChange={() => toggleFormat('A6')} />
                        </div>
                    </Section>

                    {/* Cover colors */}
                    <Section title="Цвет обложки">
                        <div className="flex flex-wrap gap-2 mb-1">
                            {form.coverColors.map((c, i) => (
                                <ColorChip key={i} color={c} onRemove={() => removeColor('coverColors', i)} />
                            ))}
                        </div>
                        <ColorInput value={coverColor} onChange={setCoverColor} onAdd={() => addColor('coverColors', coverColor, setCoverColor)} />
                    </Section>

                    {/* Pricing */}
                    <Section title="Цена">
                        <div className="mb-5">
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">Розница (BYN / шт)</p>
                            <input
                                type="number"
                                value={form.retailPrice}
                                onChange={(e) => setForm(f => ({ ...f, retailPrice: e.target.value }))}
                                placeholder="1500"
                                className="w-40 bg-black/20 border border-white/10 rounded-[12px] px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30"
                            />
                        </div>

                        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Оптовые уровни</p>
                        {form.wholesaleTiers.length > 0 && (
                            <div className="mb-3 space-y-2">
                                {form.wholesaleTiers.map((tier, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-[12px] px-4 py-2.5">
                                        <span className="text-xs text-gray-400">от <span className="text-white font-bold">{tier.minQty}</span> шт.</span>
                                        <span className="text-gray-600">→</span>
                                        <span className="text-xs text-white font-bold">{tier.pricePerUnit} BYN/шт</span>
                                        <button
                                            onClick={() => setForm(f => ({ ...f, wholesaleTiers: f.wholesaleTiers.filter((_, j) => j !== i) }))}
                                            className="ml-auto text-gray-600 hover:text-red-400 transition-colors text-sm"
                                        >×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={tierInput.minQty}
                                onChange={(e) => setTierInput(t => ({ ...t, minQty: e.target.value }))}
                                placeholder="От (шт)"
                                className="w-28 bg-black/20 border border-white/10 rounded-[12px] px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30"
                            />
                            <input
                                type="number"
                                value={tierInput.pricePerUnit}
                                onChange={(e) => setTierInput(t => ({ ...t, pricePerUnit: e.target.value }))}
                                placeholder="BYN / шт"
                                className="w-28 bg-black/20 border border-white/10 rounded-[12px] px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30"
                            />
                            <button
                                onClick={addTier}
                                className="px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-[12px] transition-all whitespace-nowrap"
                            >
                                + Уровень
                            </button>
                        </div>
                    </Section>

                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-white/5 shrink-0">
                    <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-widest rounded-[14px] transition-all">
                        Отмена
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex-1 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-[14px] hover:bg-gray-100 transition-all ${saving ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                    >
                        {saving ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Добавить')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── DealerDashboard ──────────────────────────────────────────────────────────

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
            fetchDealerProducts(currentUser.uid).then(data => {
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
        if (currentUser) {
            fetchDealerProducts(currentUser.uid).then(setProducts);
        }
    };

    const openAdd = () => { setEditingProduct(null); setShowModal(true); };
    const openEdit = (p) => { setEditingProduct(p); setShowModal(true); };

    return (
        <div className="flex h-screen font-sans text-white bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1A2642] via-[#0B0F19] to-[#080B13] overflow-hidden">

            {showModal && (
                <ProductModal
                    product={editingProduct}
                    dealerId={currentUser?.uid}
                    onClose={() => { setShowModal(false); setEditingProduct(null); }}
                    onSaved={handleProductSaved}
                />
            )}

            {/* SIDEBAR */}
            <aside className="w-60 shrink-0 flex flex-col border-r border-white/5 bg-white/[0.02] backdrop-blur-xl z-20">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-white/10 border border-white/10 rounded-[10px] flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                        </div>
                        <span className="font-bold text-sm tracking-wide">Spruzhuk</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Дилер</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{currentUser?.email}</p>
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    {[
                        { id: 'products', icon: '🗂️', label: 'Мои продукты' },
                        { id: 'orders',   icon: '📦', label: 'Заказы' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all text-left font-bold ${
                                activeTab === tab.id
                                    ? 'bg-white/10 text-white border border-white/10'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                            }`}
                        >
                            <span className="text-base">{tab.icon}</span>
                            <span className="uppercase tracking-wider text-xs">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-white/5">
                    <button
                        onClick={() => { logout(); onBack(); }}
                        className="w-full py-3 px-4 rounded-[14px] text-xs font-bold text-gray-500 hover:bg-white/5 hover:text-red-400 transition-all uppercase tracking-widest text-left"
                    >
                        Выйти
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 overflow-y-auto p-8">

                {/* ── PRODUCTS TAB ── */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Мои продукты</h2>
                                <p className="text-xs text-gray-500 mt-1">Каталог и настройки позиций</p>
                            </div>
                            <button
                                onClick={openAdd}
                                className="px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                            >
                                + Добавить продукт
                            </button>
                        </div>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center gap-3">
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Загрузка...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-2xl">📦</div>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Нет продуктов</p>
                                <button onClick={openAdd} className="px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-100 active:scale-95 transition-all">
                                    + Добавить первый
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map(prod => (
                                    <div key={prod.id} className="group relative flex flex-col rounded-[24px] bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 p-5">

                                        <div className="aspect-video bg-white/5 rounded-[16px] mb-4 border border-white/5 flex items-center justify-center">
                                            <span className="text-3xl opacity-30">📓</span>
                                        </div>

                                        <h3 className="font-bold text-base text-white mb-2">{prod.name}</h3>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {prod.formats?.map(f => (
                                                <span key={f} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-white/5 text-gray-400 border border-white/5">{f}</span>
                                            ))}
                                            {prod.binding?.map(b => (
                                                <span key={b} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">{BINDING_LABELS[b] || b}</span>
                                            ))}
                                            {prod.hasElastic && (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Резинка</span>
                                            )}
                                        </div>

                                        {/* Cover color swatches */}
                                        {prod.coverColors?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {prod.coverColors.slice(0, 10).map((c, i) => (
                                                    <div key={i} title={c.name} className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                                                ))}
                                                {prod.coverColors.length > 10 && (
                                                    <span className="text-[10px] text-gray-500 self-center">+{prod.coverColors.length - 10}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Price + actions */}
                                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <span className="font-bold text-white text-sm">{prod.retailPrice} BYN</span>
                                                {prod.wholesaleTiers?.length > 0 && (
                                                    <span className="text-[10px] text-gray-500 ml-1.5">/ опт {prod.wholesaleTiers[0].pricePerUnit} BYN</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => openEdit(prod)}
                                                    className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all"
                                                >
                                                    Изменить
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(prod.id)}
                                                    className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all"
                                                >
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

                {/* ── ORDERS TAB ── */}
                {activeTab === 'orders' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Управление заказами</h2>
                                <p className="text-xs text-gray-500 mt-1">Все входящие заявки от клиентов</p>
                            </div>
                            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)]"></div>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Firebase Live</span>
                            </div>
                        </div>

                        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[24px] overflow-hidden">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center gap-3">
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Загрузка из БД...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="py-20 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-2xl">📭</div>
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Нет заказов</p>
                                </div>
                            ) : (
                                orders.map((order, i) => (
                                    <div
                                        key={order.id}
                                        className={`px-6 py-5 grid grid-cols-[80px_1fr_1fr_1fr_auto] gap-4 items-center hover:bg-white/[0.03] transition-colors ${
                                            i !== orders.length - 1 ? 'border-b border-white/5' : ''
                                        }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-white">#{order.id.substring(0, 6).toUpperCase()}</span>
                                            <span className="text-[10px] text-gray-500 mt-0.5">{order.date}</span>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-sm text-white truncate">{order.userEmail}</span>
                                            <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">{order.role}</span>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-sm text-white truncate">{order.product}</span>
                                            <span className="text-xs text-gray-500 truncate">{order.design}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold text-white">{order.price} BYN</span>
                                        </div>
                                        <div className="flex justify-end">
                                            {order.status === 'new' ? (
                                                <button
                                                    onClick={() => handleSendToProduction(order.id)}
                                                    className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-gray-100 active:scale-95 transition-all whitespace-nowrap"
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
