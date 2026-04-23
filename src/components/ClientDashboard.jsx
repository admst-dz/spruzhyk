import { useState, useEffect } from 'react';
import { useConfigurator } from "../store";
import { fetchUserOrders, fetchAllProducts, createOrderInDB } from '../api';

const TabBtn = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`py-4 text-[10px] font-mono font-bold uppercase tracking-[0.2em] border-b-2 transition-all ${
            active
                ? 'border-ink-900 text-ink-900 dark:border-[#C9A96E] dark:text-[#C9A96E]'
                : 'border-transparent text-paper-400 dark:text-white/25 hover:text-ink-700 dark:hover:text-white/50'
        }`}
    >
        {children}
    </button>
);

const OrderStatus = ({ status }) => {
    const s = {
        processing: { text: 'В обработке', cls: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
        production: { text: 'В производстве', cls: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' },
        in_delivery: { text: 'Доставляется', cls: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' },
        done: { text: 'Готово', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
        new: { text: 'Ожидает', cls: 'bg-paper-100 text-paper-500 border-paper-200 dark:bg-white/5 dark:text-white/30 dark:border-white/10' },
    }[status] || { text: status, cls: 'bg-paper-100 text-paper-500 border-paper-200 dark:bg-white/5 dark:text-white/30 dark:border-white/10' };

    return (
        <span className={`px-3 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider border ${s.cls}`}>
            {s.text}
        </span>
    );
};

export const ClientDashboard = ({ onBack, showSuccessToast, onSuccessToastShown }) => {
    const { currentUser, logout, clientSubRole, cartItem, clearCart, addToCart } = useConfigurator();
    const [activeTab, setActiveTab] = useState(cartItem ? 'cart' : 'catalog');

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
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
        <div className="min-h-screen font-sans flex flex-col
            bg-paper-100 text-ink-900
            dark:bg-[#0C0B09] dark:text-[#F0EBE1] transition-colors duration-500">

            {/* HEADER */}
            <header className="sticky top-0 z-30 px-6 py-4 border-b backdrop-blur-xl
                border-paper-200 bg-paper-50/90
                dark:border-white/[0.05] dark:bg-[#0C0B09]/90">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 border rounded-lg flex items-center justify-center
                                border-paper-300 dark:border-[#C9A96E]/30">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                    strokeLinecap="round" strokeLinejoin="round"
                                    className="text-paper-500 dark:text-[#C9A96E]">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <span className="font-display text-base font-600 tracking-wide text-ink-900 dark:text-[#F0EBE1]">Spruzhyk</span>
                        </div>
                        <div className="hidden md:flex flex-col">
                            <span className="text-sm font-bold text-ink-800 dark:text-white/80">
                                {currentUser?.display_name || currentUser?.email?.split('@')[0]}
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/25">
                                {currentUser?.email}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => { logout(); onBack(); }}
                        className="h-8 px-4 rounded-full border text-[10px] font-mono font-bold uppercase tracking-widest transition-all
                            border-paper-300 text-ink-700 hover:border-paper-500 hover:text-ink-900 bg-paper-50
                            dark:border-white/10 dark:text-white/40 dark:hover:border-white/30 dark:hover:text-white/80 dark:bg-transparent"
                    >
                        Выйти
                    </button>
                </div>

                {/* TABS */}
                <div className="max-w-5xl mx-auto flex gap-8">
                    <TabBtn active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')}>Каталог</TabBtn>
                    <TabBtn active={activeTab === 'cart'} onClick={() => setActiveTab('cart')}>
                        Корзина{cartItem && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-paper-500 dark:bg-[#C9A96E] inline-block" />}
                    </TabBtn>
                    <TabBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>Заказы</TabBtn>
                </div>
            </header>

            {/* MAIN */}
            <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">

                {/* CATALOG TAB */}
                {activeTab === 'catalog' && (
                    <div>
                        {productsLoading ? (
                            <div className="py-20 flex flex-col items-center gap-3">
                                <div className="w-5 h-5 border-2 rounded-full animate-spin
                                    border-paper-300 border-t-paper-500
                                    dark:border-white/10 dark:border-t-white/40" />
                                <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/25">Загрузка...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-20 flex flex-col items-center gap-3">
                                <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/20">Каталог пуст</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {products.map(prod => (
                                    <div key={prod.id}
                                        className="group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-500 p-6
                                            bg-white border-paper-200 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-paper-300
                                            dark:bg-white/[0.03] dark:border-white/[0.06] dark:hover:bg-white/[0.06] dark:hover:border-white/[0.12]">
                                        <div className="mb-4 h-32 bg-paper-100 dark:bg-white/[0.03] rounded-xl border border-paper-200 dark:border-white/5 flex items-center justify-center">
                                            <svg width="40" height="56" viewBox="0 0 100 130" fill="none" className="opacity-30 dark:opacity-20">
                                                <rect x="20" y="10" width="62" height="110" rx="3" fill="currentColor"/>
                                                <path d="M78 12 V118 L84 116 V14 Z" fill="#C9A96E" />
                                            </svg>
                                        </div>
                                        <h3 className="font-bold text-sm text-ink-900 dark:text-white/90 mb-1">{prod.name}</h3>
                                        {prod.formats?.length > 0 && (
                                            <p className="font-mono text-[9px] uppercase tracking-wider text-paper-400 dark:text-white/25 mb-0.5">
                                                Форматы: {prod.formats.join(', ')}
                                            </p>
                                        )}
                                        {prod.binding?.length > 0 && (
                                            <p className="font-mono text-[9px] uppercase tracking-wider text-paper-400 dark:text-white/25">
                                                Переплёт: {prod.binding.map(b => b === 'hard' ? 'Твёрдый' : 'На пружине').join(', ')}
                                            </p>
                                        )}
                                        <div className="pt-4 border-t border-paper-200 dark:border-white/5 mt-auto">
                                            <span className="font-bold text-ink-900 dark:text-white/90 text-sm">
                                                {prod.retailPrice ? `${prod.retailPrice} BYN` : 'По запросу'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CART TAB */}
                {activeTab === 'cart' && (
                    <div className="max-w-xl">
                        <div className="rounded-2xl border p-8
                            bg-white border-paper-200 shadow-[0_2px_24px_rgba(0,0,0,0.05)]
                            dark:bg-white/[0.03] dark:border-white/[0.07]">
                            {!cartItem ? (
                                <div className="py-16 flex flex-col items-center gap-4">
                                    <div className="w-14 h-14 border rounded-full flex items-center justify-center
                                        border-paper-200 bg-paper-100 dark:border-white/8 dark:bg-white/[0.03]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                            className="text-paper-400 dark:text-white/20"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                                    </div>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/20">Корзина пуста</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-display text-2xl font-300 text-ink-900 dark:text-[#F0EBE1]">{cartItem.productName}</h3>
                                            <p className="text-sm text-paper-500 dark:text-white/40 mt-1">{cartItem.design}</p>
                                        </div>
                                        <span className="font-bold text-xl text-ink-900 dark:text-white/90">{cartItem.priceBYN} BYN</span>
                                    </div>

                                    <div className="rounded-xl border p-5 mb-5
                                        border-paper-200 bg-paper-100/60 dark:border-white/5 dark:bg-white/[0.03]">
                                        <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/20 mb-4">Визуализация</p>
                                        {cartItem.status === 'draft' ? (
                                            <button
                                                onClick={handleGenerateRenders}
                                                disabled={isGenerating}
                                                className="w-full py-4 border-2 border-dashed rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all
                                                    border-paper-300 text-paper-400 hover:border-paper-500 hover:text-ink-700
                                                    dark:border-white/10 dark:text-white/30 dark:hover:border-white/30 dark:hover:text-white/60"
                                            >
                                                {isGenerating ? 'Генерация...' : 'Сгенерировать рендеры'}
                                            </button>
                                        ) : (
                                            <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3 rounded-lg">
                                                Файлы готовы — проверьте дизайн
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleApprove}
                                        disabled={cartItem.status === 'draft'}
                                        className={`w-full py-4 font-bold text-sm rounded-xl transition-all
                                            ${cartItem.status === 'draft'
                                                ? 'bg-paper-100 text-paper-400 cursor-not-allowed border border-paper-200 dark:bg-white/[0.03] dark:text-white/15 dark:border-white/5'
                                                : 'bg-ink-900 text-white hover:bg-ink-800 active:scale-[0.98] dark:bg-transparent dark:border dark:border-[#C9A96E]/50 dark:text-[#C9A96E] dark:hover:bg-[#C9A96E]/10'
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
                        <h2 className="font-display text-2xl font-300 text-ink-900 dark:text-[#F0EBE1] mb-6">Мои заказы</h2>
                        <div className="rounded-2xl border overflow-hidden
                            bg-white border-paper-200 shadow-[0_2px_24px_rgba(0,0,0,0.05)]
                            dark:bg-white/[0.02] dark:border-white/[0.06]">
                            {ordersLoading ? (
                                <div className="py-20 flex flex-col items-center gap-3">
                                    <div className="w-5 h-5 border-2 rounded-full animate-spin
                                        border-paper-300 border-t-paper-500
                                        dark:border-white/10 dark:border-t-white/40" />
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/25">Загрузка...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="py-20 flex flex-col items-center gap-4">
                                    <div className="w-14 h-14 border rounded-full flex items-center justify-center
                                        border-paper-200 bg-paper-100 dark:border-white/8 dark:bg-white/[0.03]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                            className="text-paper-400 dark:text-white/20"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                                    </div>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/20">Нет заказов</p>
                                </div>
                            ) : (
                                orders.map((order, i) => (
                                    <div
                                        key={order.id}
                                        className={`px-6 py-4 flex items-center gap-4 transition-colors
                                            hover:bg-paper-50 dark:hover:bg-white/[0.02]
                                            ${i !== orders.length - 1 ? 'border-b border-paper-100 dark:border-white/[0.04]' : ''}`}
                                    >
                                        <div className="flex flex-col min-w-[80px]">
                                            <span className="font-bold text-sm text-ink-900 dark:text-white/90">
                                                #{order.id.substring(0, 6).toUpperCase()}
                                            </span>
                                            <span className="font-mono text-[9px] uppercase tracking-wider text-paper-400 dark:text-white/25 mt-0.5">
                                                {order.date}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-ink-900 dark:text-white/90 truncate">{order.product}</p>
                                            <p className="text-xs text-paper-500 dark:text-white/35 truncate">{order.design}</p>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="font-bold text-ink-900 dark:text-white/90 text-sm">{order.price} BYN</span>
                                            <OrderStatus status={order.status} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="text-center pb-6 z-10">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-paper-300 dark:text-white/10">
                    By Spoogeek · {new Date().getFullYear()}
                </span>
            </footer>

            {/* SUCCESS TOAST */}
            {orderSuccess && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="rounded-2xl border px-10 py-8 shadow-2xl text-center pointer-events-auto animate-fade-in
                        bg-white border-paper-200 shadow-ink-900/10
                        dark:bg-[#13110E] dark:border-white/[0.07] dark:shadow-black/60">
                        <div className="w-12 h-12 border rounded-full flex items-center justify-center mx-auto mb-4
                            border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/8">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                strokeLinecap="round" strokeLinejoin="round"
                                className="text-emerald-600 dark:text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <p className="font-display text-xl font-300 text-ink-900 dark:text-[#F0EBE1]">Заказ оформлен</p>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-paper-400 dark:text-white/30 mt-2">
                            Менеджер свяжется с вами в ближайшее время
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
