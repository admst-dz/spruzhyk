import React, { useState, useEffect } from 'react';
import { useConfigurator } from "../store";
import { getAllOrders, updateOrderStatus } from '../firebase'; // Добавим функцию обновления (пока заглушка)

export const DealerDashboard = ({ onBack }) => {
    const { currentUser, logout } = useConfigurator();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getAllOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Локальная функция смены статуса (для UI)
    const handleSendToProduction = (orderId) => {
        // В реальном проекте тут будет await updateDoc...
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'production' } : o));
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="min-h-screen bg-[#F2F4F7] font-zen text-[#1a1a1a] p-4 md:p-8">

            {/* ШАПКА */}
            <header className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider text-[#1a1a1a]">Кабинет Дилера</h1>
                    <p className="text-[#1a1a1a]/60 font-bold text-sm mt-1">{currentUser?.displayName || 'Authorized Dealer'}</p>
                </div>
                <button
                    onClick={logout}
                    className="px-6 py-2 bg-white rounded-full shadow-sm text-sm font-bold text-[#1a1a1a] border border-gray-300 hover:bg-red-50 hover:text-red-600 transition"
                >
                    Выйти
                </button>
            </header>

            {/* СТАТИСТИКА */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-7xl mx-auto">
                <StatCard label="Всего" value={orders.length} active={filter === 'all'} onClick={() => setFilter('all')} />
                <StatCard label="Новые" value={orders.filter(o => o.status === 'new').length} active={filter === 'new'} onClick={() => setFilter('new')} />
                <StatCard label="В работе" value={orders.filter(o => o.status === 'production').length} active={filter === 'production'} onClick={() => setFilter('production')} />
                <StatCard label="Архив" value={orders.filter(o => o.status === 'done').length} active={filter === 'done'} onClick={() => setFilter('done')} />
            </div>

            {/* ТАБЛИЦА */}
            <div className="max-w-7xl mx-auto bg-white rounded-[20px] shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64 text-gray-500 font-bold animate-pulse">Загрузка данных...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-400 font-bold">Список заказов пуст</div>
                ) : (
                    <div className="flex flex-col">
                        {/* Хедер таблицы */}
                        <div className="hidden md:grid grid-cols-6 gap-4 p-6 border-b border-gray-200 bg-gray-50">
                            <span className="col-span-1 text-xs font-bold text-gray-500 uppercase tracking-widest">ID / Дата</span>
                            <span className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Клиент</span>
                            <span className="col-span-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Детали</span>
                            <span className="col-span-1 text-xs font-bold text-gray-500 uppercase tracking-widest">Тираж</span>
                            <span className="col-span-1 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Статус</span>
                        </div>

                        {/* Строки */}
                        {filteredOrders.map(order => (
                            <div key={order.id} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors flex flex-col md:grid md:grid-cols-6 gap-4 items-center">

                                <div className="w-full col-span-1">
                                    <div className="font-black text-sm text-[#1a1a1a]">#{order.id.slice(0, 6)}</div>
                                    <div className="text-xs text-gray-500 font-bold mt-1">{order.date}</div>
                                </div>

                                <div className="w-full col-span-2">
                                    <div className="font-bold text-[#1a1a1a] text-lg">{order.clientInfo?.name || 'Гость'}</div>
                                    <div className="text-xs text-gray-500 font-bold">{order.clientInfo?.phone}</div>
                                    {order.clientType === 'jur' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold ml-2">ЮР.ЛИЦО</span>}
                                </div>

                                <div className="w-full col-span-1 text-sm font-bold text-[#1a1a1a]">
                                    {order.productConfig?.type === 'notebook' ? 'Ежедневник' : 'Календарь'}
                                    <span className="text-gray-400 ml-1 font-normal">({order.productConfig?.format})</span>
                                </div>

                                <div className="w-full col-span-1 font-bold text-[#1a1a1a]">
                                    {order.quantity} шт.
                                </div>

                                <div className="w-full col-span-1 flex justify-end">
                                    {order.status === 'new' ? (
                                        <button
                                            onClick={() => handleSendToProduction(order.id)}
                                            className="px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded-[8px] hover:bg-gray-800 shadow-md transition-all whitespace-nowrap"
                                        >
                                            В работу
                                        </button>
                                    ) : (
                                        <StatusBadge status={order.status} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Исправленный компонент карточки с принудительно черным текстом
const StatCard = ({ label, value, active, onClick }) => (
    <button
        onClick={onClick}
        className={`p-6 rounded-[20px] border flex flex-col items-start gap-1 transition-all text-left bg-white
            ${active ? 'border-black ring-1 ring-black shadow-lg' : 'border-transparent shadow-sm hover:shadow-md'}
        `}
    >
        <span className="text-3xl md:text-4xl font-black text-[#1a1a1a]">{value}</span>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500">{label}</span>
    </button>
)

const StatusBadge = ({ status }) => {
    const styles = {
        new: 'bg-gray-200 text-black',
        production: 'bg-blue-100 text-blue-800',
        done: 'bg-green-100 text-green-800'
    };
    const labels = {
        new: 'Новый',
        production: 'В работе',
        done: 'Архив'
    };
    return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100'}`}>
            {labels[status] || status}
        </span>
    );
}