import { useState, useEffect } from 'react';
import { useConfigurator } from "../store";
import { db, fetchUserOrders } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

export const ClientDashboard = ({ onOpenConfigurator, onBack, showSuccessToast, onSuccessToastShown }) => {
    const { currentUser, logout, clientSubRole, cartItem, clearCart, addToCart } = useConfigurator();
    const [activeTab, setActiveTab] = useState(cartItem ? 'cart' : 'catalog');

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

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
            fetchUserOrders(currentUser.uid, currentUser.email).then(data => {
                data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                setOrders(data);
                setOrdersLoading(false);
            });
        }
    }, [activeTab, currentUser]);

    const corporateCatalog = [
        { id: 'c1', name: 'Ежедневник', desc: 'Кастомизация обложки, бумага, переплёт', priceRUB: 1500, img: '/patterns/Notebook.svg', has3D: true, accent: 'blue' },
        { id: 'c2', name: 'Календарь настольный', desc: 'В разработке', priceRUB: 800, img: '/patterns/Calendar.svg', has3D: false, accent: 'indigo' },
    ];

    const accentMap = {
        blue: 'bg-blue-500/20 group-hover:bg-blue-500/30',
        indigo: 'bg-indigo-500/20 group-hover:bg-indigo-500/30',
        teal: 'bg-teal-500/20 group-hover:bg-teal-500/30',
    };

    const handleGenerateRenders = () => {
        setIsGenerating(true);
        setTimeout(() => {
            addToCart({ ...cartItem, status: 'renders_ready', rendersGenerated: 3 });
            setIsGenerating(false);
        }, 1500);
    };

    const handleApprove = async () => {
        try {
            const orderPayload = {
                userId: currentUser ? currentUser.uid : 'guest',
                userEmail: currentUser ? currentUser.email : 'user@mail.com',
                role: clientSubRole || 'client',
                product: cartItem.productName,
                design: cartItem.design,
                price: cartItem.priceRUB,
                currency: 'RUB',
                status: 'new',
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'Orders'), orderPayload);

            const newOrder = {
                id: docRef.id,
                ...orderPayload,
                createdAt: null,
                date: new Date().toLocaleDateString(),
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
                            <span className="text-sm font-bold text-white">{currentUser?.displayName || currentUser?.email?.split('@')[0]}</span>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {corporateCatalog.map(prod => (
                            <div
                                key={prod.id}
                                className="group relative flex flex-col rounded-[24px] bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 p-6"
                            >
                                <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-[70px] rounded-full transition-colors duration-500 ${accentMap[prod.accent] || accentMap.blue}`}></div>
                                <div className="relative z-10 aspect-square bg-white/5 rounded-[16px] mb-5 flex items-center justify-center p-6 border border-white/5">
                                    <img src={prod.img} alt={prod.name} className="w-[55%] opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500" />
                                </div>
                                <div className="relative z-10 flex flex-col flex-1">
                                    <h3 className="font-bold text-base text-white mb-1">{prod.name}</h3>
                                    <p className="text-xs text-gray-500 mb-4 flex-1">{prod.desc}</p>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                        <span className="font-bold text-white">{prod.priceRUB} ₽</span>
                                        {prod.has3D ? (
                                            <button
                                                onClick={onOpenConfigurator}
                                                className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                                            >
                                                В 3D Редактор
                                            </button>
                                        ) : (
                                            <button className="px-4 py-2 bg-white/5 text-gray-600 text-xs font-bold uppercase tracking-widest rounded-full cursor-not-allowed border border-white/5">
                                                В разработке
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                        <span className="font-bold text-2xl text-white">{cartItem.priceRUB} ₽</span>
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
                                orders.map((order, i) => (
                                    <div
                                        key={order.id}
                                        className={`px-6 py-5 flex items-center gap-4 hover:bg-white/[0.03] transition-colors ${i !== orders.length - 1 ? 'border-b border-white/5' : ''}`}
                                    >
                                        <div className="flex flex-col min-w-[80px]">
                                            <span className="font-bold text-sm text-white">#{order.id.substring(0, 6).toUpperCase()}</span>
                                            <span className="text-[10px] text-gray-500 mt-0.5">{order.date}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-white truncate">{order.product}</p>
                                            <p className="text-xs text-gray-500 truncate">{order.design}</p>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="font-bold text-white text-sm">{order.price} ₽</span>
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
