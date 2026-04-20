import React, { useState, useEffect } from 'react';
import { useConfigurator } from "../store";
import { fetchAllOrders, updateOrderStatus } from '../firebase';

export const DealerDashboard = ({ onBack }) => {
    const { currentUser, logout } = useConfigurator();
    const [activeTab, setActiveTab] = useState('orders');
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

    // БОЕВАЯ ФУНКЦИЯ ИЗМЕНЕНИЯ СТАТУСА
    const handleSendToProduction = async (orderId) => {
        // Меняем в Firestore
        await updateOrderStatus(orderId, 'production');
        // Меняем локально
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'production' } : o));
    };

    return (
        <div className="flex h-screen bg-[#F0F2F5] font-zen text-[#1a1a1a] overflow-hidden">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20 shrink-0">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-black tracking-widest uppercase">ДИЛЕР</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">{currentUser?.email}</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button onClick={() => setActiveTab('orders')} className={`w-full flex gap-4 px-5 py-4 rounded-[16px] transition-all text-left ${activeTab === 'orders' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <span className="text-xl">📦</span><span className="font-bold text-sm uppercase">Заказы ПЛ/КЛ</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button onClick={logout} className="w-full py-3 text-sm font-bold text-gray-500 hover:text-red-500">Выйти</button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto space-y-8 pb-32">
                {activeTab === 'orders' && (
                    <div className="animate-fade-in bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-black uppercase">Управление заказами</h2>
                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Синхронизировано с Firebase</span>
                        </div>
                        {loading ? <div className="p-10 text-center font-bold text-gray-400">Загрузка из БД...</div> : (
                            <div className="flex flex-col">
                                {orders.map(order => (
                                    <div key={order.id} className="p-6 border-b border-gray-50 hover:bg-gray-50 grid grid-cols-6 gap-4 items-center">
                                        <div className="col-span-1 flex flex-col"><span className="font-black text-lg">#{order.id.substring(0,6).toUpperCase()}</span><span className="text-xs font-bold text-gray-400">{order.date}</span></div>
                                        <div className="col-span-2 flex flex-col"><span className="font-bold">{order.userEmail}</span><span className="text-[10px] text-gray-400">Роль: {order.role}</span></div>
                                        <div className="col-span-2 flex flex-col"><span className="font-bold">{order.product}</span><span className="text-xs text-gray-500 font-bold">{order.design}</span></div>
                                        <div className="col-span-1 flex flex-col items-end gap-2">
                                            {order.status === 'new' ? (
                                                <button onClick={() => handleSendToProduction(order.id)} className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase rounded-[8px] hover:bg-[#0054FF] transition-all">В производство →</button>
                                            ) : (
                                                <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-blue-100 text-blue-900">В ПРОИЗВОДСТВЕ</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};