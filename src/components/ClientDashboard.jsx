import { useState, useEffect } from 'react';
import { useConfigurator } from "../store";
import { fetchUserOrders, fetchAllProducts, createOrderInDB } from '../api';

const TabBtn = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
            active
                ? 'border-white text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
        }`}
    >
        {children}
    </button>
);

const ORDER_STAGES = [
    { key: 'new',         label: 'Ожидает',        icon: '🕐' },
    { key: 'production',  label: 'Производство',    icon: '🏭' },
    { key: 'processing',  label: 'Обработка',       icon: '⚙️' },
    { key: 'in_delivery', label: 'Доставка',        icon: '🚚' },
    { key: 'done',        label: 'Готово',          icon: '✅' },
];

const STAGE_INDEX = Object.fromEntries(ORDER_STAGES.map((s, i) => [s.key, i]));

const OrderProgressBar = ({ status, stageHistory = [] }) => {
    const currentIdx = STAGE_INDEX[status] ?? 0;
    const historyMap = {};
    stageHistory.forEach(h => { historyMap[h.status] = h; });

    return (
        <div className="pt-4 pb-2">
            {/* Steps */}
            <div className="relative flex items-start">
                {/* Connecting line */}
                <div className="absolute top-4 left-0 right-0 h-px bg-white/10 mx-8" style={{ zIndex: 0 }} />
                {ORDER_STAGES.map((stage, idx) => {
                    const isDone = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const entry = historyMap[stage.key];
                    return (
                        <div key={stage.key} className="flex-1 flex flex-col items-center gap-2 relative z-10">
                            {/* Circle */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all text-sm
                                ${isDone ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400'
                                    : isCurrent ? 'bg-indigo-500/30 border-indigo-400 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                                    : 'bg-white/5 border-white/15 text-gray-600'}`}
                            >
                                {isDone ? (
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6l2.5 2.5L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                ) : (
                                    <span className="text-[10px]">{stage.icon}</span>
                                )}
                            </div>
                            {/* Label */}
                            <span className={`text-[9px] font-bold uppercase tracking-wider text-center leading-tight
                                ${isDone ? 'text-emerald-400' : isCurrent ? 'text-indigo-300' : 'text-gray-600'}`}>
                                {stage.label}
                            </span>
                            {/* Timestamp + comment */}
                            {entry && (
                                <div className="flex flex-col items-center gap-0.5 max-w-[80px]">
                                    <span className="text-[8px] text-gray-500 text-center">
                                        {new Date(entry.updated_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                                    </span>
                                    {entry.comment && (
                                        <span className="text-[8px] text-gray-400 text-center italic leading-tight line-clamp-2">
                                            {entry.comment}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const OrderStatus = ({ status }) => {
    const s = {
        processing: { text: 'В обработке', color: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
        production: { text: 'В производстве', color: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' },
        in_delivery: { text: 'Доставляется', color: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
        done: { text: 'Готово', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
        new: { text: 'Ожидает', color: 'bg-white/10 text-gray-400 border border-white/10' },
    }[status] || { text: status, color: 'bg-white/10 text-gray-400 border border-white/10' };

    return (
        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.color}`}>
            {s.text}
        </span>
    );
};

export const ClientDashboard = ({ onBack, showSuccessToast, onSuccessToastShown }) => {
    const { currentUser, logout, clientSubRole, cartItem, clearCart, addToCart } = useConfigurator();
    const [activeTab, setActiveTab] = useState(cartItem ? 'cart' : 'catalog');

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState(new Set());
    const [isGenerating, setIsGenerating] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    useEffect(() => {
        if (showSuccessToast) {
            setActiveTab('orders');
            setOrderSuccess(true);
            onSuccessToastShown?.();
        }
    }, [showSuccessToast]);

    useEffect(() => {
        if (orderSuccess) {
            const t = setTimeout(() => setOrderSuccess(false), 4000);
            return () => clearTimeout(t);
        }
    }, [orderSuccess]);

    useEffect(() => {
        if (activeTab === 'orders' && currentUser) {
            setOrdersLoading(true);
            fetchUserOrders(currentUser.id).then(data => {
                data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                setOrders(data);
                setOrdersLoading(false);
            });
        }
    }, [activeTab, currentUser]);

    useEffect(() => {
        if (activeTab === 'catalog') {
            setProductsLoading(true);
            fetchAllProducts().then(data => {
                setProducts(data);
                setProductsLoading(false);
            });
        }
    }, [activeTab]);


    const handleGenerateRenders = () => {
        setIsGenerating(true);
        setTimeout(() => {
            addToCart({ ...cartItem, status: 'renders_ready', rendersGenerated: 3 });
            setIsGenerating(false);
        }, 1500);
    };

    const handleApprove = async () => {
        try {
            const id = await createOrderInDB({
                user_id: currentUser?.id || null,
                user_email: currentUser?.email || '',
                product_name: cartItem.productName,
                configuration: {
                    productConfig: cartItem,
                    clientType: clientSubRole || 'client',
                },
                quantity: 1,
                total_price: cartItem.priceBYN || null,
                currency: 'BYN',
                is_guest: false,
            });

            const newOrder = {
                id,
                product: cartItem.productName,
                design: cartItem.design || '',
                price: cartItem.priceBYN || 0,
                status: 'new',
                date: new Date().toLocaleDateString('ru-RU'),
            };
            setOrders(prev => [newOrder, ...prev]);
            setOrderSuccess(true);
            clearCart();
            setActiveTab('orders');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen font-sans text-white bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1A2642] via-[#0B0F19] to-[#080B13] overflow-x-hidden flex flex-col">

            {/* HEADER */}
            <header className="sticky top-0 z-30 px-6 py-4 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                            <span className="font-bold text-sm tracking-wide">Spruzhuk</span>
                        </div>
                        <div className="hidden md:flex flex-col">
                            <span className="text-sm font-bold text-white">{currentUser?.display_name || currentUser?.email?.split('@')[0]}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{currentUser?.email}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => { logout(); onBack(); }}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors px-4 py-2 rounded-full text-xs font-bold text-gray-300 uppercase tracking-widest"
                    >
                        Выйти
                    </button>
                </div>

                {/* TABS */}
                <div className="max-w-6xl mx-auto flex gap-8 mt-1">
                    <TabBtn active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')}>Каталог</TabBtn>
                    <TabBtn active={activeTab === 'cart'} onClick={() => setActiveTab('cart')}>
                        Корзина {cartItem && <span className="ml-1 w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>}
                    </TabBtn>
                    <TabBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>Заказы</TabBtn>
                </div>
            </header>

            {/* MAIN */}
            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">

                {/* CATALOG TAB */}
                {activeTab === 'catalog' && (
                    <div>
                        {productsLoading ? (
                            <div className="py-16 flex flex-col items-center gap-3">
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Загрузка...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-16 flex flex-col items-center gap-4">
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Каталог пуст</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {products.map(prod => (
                                    <div key={prod.id} className="group relative flex flex-col rounded-[24px] bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 p-6">
                                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-[70px] rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors duration-500"></div>
                                        <div className="relative z-10 flex flex-col flex-1 gap-3">
                                            <h3 className="font-bold text-base text-white">{prod.name}</h3>
                                            {prod.formats?.length > 0 && (
                                                <p className="text-xs text-gray-500">Форматы: {prod.formats.join(', ')}</p>
                                            )}
                                            {prod.binding?.length > 0 && (
                                                <p className="text-xs text-gray-500">Переплёт: {prod.binding.map(b => b === 'hard' ? 'Твёрдый' : 'На пружине').join(', ')}</p>
                                            )}
                                            <div className="pt-4 border-t border-white/5 mt-auto">
                                                <span className="font-bold text-white">{prod.retailPrice ? `${prod.retailPrice} BYN` : 'По запросу'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CART TAB */}
                {activeTab === 'cart' && (
                    <div className="max-w-2xl">
                        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[24px] p-8">
                            {!cartItem ? (
                                <div className="py-16 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-2xl">🛒</div>
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Корзина пуста</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-bold text-xl text-white">{cartItem.productName}</h3>
                                            <p className="text-sm text-gray-400 mt-1">{cartItem.design}</p>
                                        </div>
                                        <span className="font-bold text-2xl text-white">{cartItem.priceBYN} BYN</span>
                                    </div>

                                    <div className="bg-white/5 p-5 rounded-[16px] mb-6 border border-white/5">
                                        <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-4">Визуализация</h4>
                                        {cartItem.status === 'draft' ? (
                                            <button
                                                onClick={handleGenerateRenders}
                                                disabled={isGenerating}
                                                className="w-full py-4 border-2 border-dashed border-white/20 text-gray-300 font-bold uppercase tracking-widest rounded-[12px] hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all text-sm"
                                            >
                                                {isGenerating ? 'Генерация...' : 'Сгенерировать рендеры'}
                                            </button>
                                        ) : (
                                            <p className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-[10px]">
                                                ✅ Файлы успешно сгенерированы. Проверьте дизайн.
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleApprove}
                                        disabled={cartItem.status === 'draft'}
                                        className={`w-full py-4 font-bold uppercase tracking-widest rounded-[14px] transition-all text-sm ${
                                            cartItem.status === 'draft'
                                                ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                                                : 'bg-white text-black hover:bg-gray-100 shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98]'
                                        }`}
                                    >
                                        Оформить заказ
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-widest mb-6 text-white">Мои заказы</h2>
                        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[24px] overflow-hidden">
                            {ordersLoading ? (
                                <div className="py-16 flex flex-col items-center gap-3">
                                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Загрузка...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="py-16 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-2xl">📋</div>
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Нет заказов</p>
                                </div>
                            ) : (
                                orders.map((order, i) => {
                                    const isExpanded = expandedOrders.has(order.id);
                                    const toggleExpand = () => setExpandedOrders(prev => {
                                        const next = new Set(prev);
                                        next.has(order.id) ? next.delete(order.id) : next.add(order.id);
                                        return next;
                                    });
                                    return (
                                        <div
                                            key={order.id}
                                            className={`transition-colors ${i !== orders.length - 1 ? 'border-b border-white/5' : ''}`}
                                        >
                                            <div
                                                className="px-4 md:px-6 py-4 md:py-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-white/[0.03] cursor-pointer"
                                                onClick={toggleExpand}
                                            >
                                                <div className="flex items-center justify-between sm:block sm:min-w-[80px]">
                                                    <span className="font-bold text-sm text-white">#{order.id.substring(0, 6).toUpperCase()}</span>
                                                    <span className="text-[10px] text-gray-500 sm:mt-0.5 sm:block">{order.date}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-white truncate">{order.product}</p>
                                                    <p className="text-xs text-gray-500 truncate">{order.design}</p>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                                                    <span className="font-bold text-white text-sm">{order.price} BYN</span>
                                                    <OrderStatus status={order.status} />
                                                    <svg
                                                        width="14" height="14" viewBox="0 0 14 14" fill="none"
                                                        className={`text-gray-500 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                                    >
                                                        <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                            </div>
                                            {isExpanded && (
                                                <div className="px-4 md:px-6 pb-5 border-t border-white/5 bg-white/[0.02]">
                                                    <OrderProgressBar status={order.status} stageHistory={order.stageHistory} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="text-center pb-6 z-10">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-700">
                    By Spoogeek • Liquid Glass Edition
                </span>
            </footer>

            {/* SUCCESS TOAST */}
            {orderSuccess && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-[#1A1F2E]/90 backdrop-blur-2xl border border-white/10 rounded-[24px] px-10 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-center pointer-events-auto animate-fade-in">
                        <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <p className="font-bold text-lg text-white uppercase tracking-wide">Заказ оформлен!</p>
                        <p className="text-sm text-gray-400 mt-2">Менеджер свяжется с вами в ближайшее время</p>
                    </div>
                </div>
            )}
        </div>
    );
};
