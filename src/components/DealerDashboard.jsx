import { useState, useEffect } from 'react';
import { useConfigurator } from "../store";
import { fetchAllOrders, updateOrderStatus } from '../firebase';

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

export const DealerDashboard = ({ onBack }) => {
    const { currentUser, logout } = useConfigurator();
    const [activeTab, setActiveTab] = useState('products');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'orders') {
            setLoading(true);
            fetchAllOrders().then(data => {
                data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                setOrders(data);
                setLoading(false);
            });
        }
    }, [activeTab]);

    const handleSendToProduction = async (orderId) => {
        await updateOrderStatus(orderId, 'production');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'production' } : o));
    };

    return (
        <div className="flex h-screen font-sans text-white bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1A2642] via-[#0B0F19] to-[#080B13] overflow-hidden">

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
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all text-left font-bold ${
                            activeTab === 'products'
                                ? 'bg-white/10 text-white border border-white/10'
                                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                        }`}
                    >
                        <span className="text-base">🗂️</span>
                        <span className="uppercase tracking-wider text-xs">Мои продукты</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all text-left font-bold ${
                            activeTab === 'orders'
                                ? 'bg-white/10 text-white border border-white/10'
                                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                        }`}
                    >
                        <span className="text-base">📦</span>
                        <span className="uppercase tracking-wider text-xs">Заказы</span>
                    </button>
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
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Мои продукты</h2>
                                <p className="text-xs text-gray-500 mt-1">Каталог доступных позиций</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { name: 'Ежедневник', desc: 'A5 / A6, твёрдая / мягкая обложка', img: '/patterns/Notebook.svg', accent: 'bg-blue-500/20 group-hover:bg-blue-500/30', available: true },
                                { name: 'Календарь настольный', desc: 'В разработке', img: '/patterns/Calendar.svg', accent: 'bg-indigo-500/20 group-hover:bg-indigo-500/30', available: false },
                            ].map(prod => (
                                <div key={prod.name} className="group relative flex flex-col rounded-[24px] bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 p-6">
                                    <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-[70px] rounded-full transition-colors duration-500 ${prod.accent}`}></div>
                                    <div className="relative z-10 aspect-square bg-white/5 rounded-[16px] mb-5 flex items-center justify-center p-6 border border-white/5">
                                        <img src={prod.img} alt={prod.name} className="w-[55%] opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500" />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-base text-white mb-1">{prod.name}</h3>
                                        <p className="text-xs text-gray-500">{prod.desc}</p>
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            {prod.available ? (
                                                <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                    Доступно
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-600 border border-white/5">
                                                    В разработке
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                                        {/* ID + дата */}
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-white">#{order.id.substring(0, 6).toUpperCase()}</span>
                                            <span className="text-[10px] text-gray-500 mt-0.5">{order.date}</span>
                                        </div>

                                        {/* Email + роль */}
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-sm text-white truncate">{order.userEmail}</span>
                                            <span className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">{order.role}</span>
                                        </div>

                                        {/* Продукт + дизайн */}
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-sm text-white truncate">{order.product}</span>
                                            <span className="text-xs text-gray-500 truncate">{order.design}</span>
                                        </div>

                                        {/* Цена */}
                                        <div>
                                            <span className="font-bold text-white">{order.price} ₽</span>
                                        </div>

                                        {/* Статус / Кнопка */}
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
