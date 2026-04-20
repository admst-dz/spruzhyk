import React, { useState, useEffect } from 'react';
import { useConfigurator } from "../store";
import { db, fetchUserOrders } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const TabBtn = ({ active, children, onClick }) => (
    <button onClick={onClick} className={`py-4 text-sm font-bold uppercase tracking-widest border-b-[3px] transition-colors flex items-center ${active ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
        {children}
    </button>
);

const OrderStatus = ({ status }) => {
    const s = {
        processing: { text: 'В обработке', color: 'bg-gray-100 text-gray-600' },
        production: { text: 'В производстве', color: 'bg-blue-100 text-blue-700' },
        in_delivery: { text: 'Доставляется', color: 'bg-yellow-100 text-yellow-700' },
        done: { text: 'Готово', color: 'bg-green-100 text-green-700' },
        new: { text: 'Ожидает', color: 'bg-gray-100 text-gray-600' }
    }[status] || { text: status, color: 'bg-gray-100 text-gray-600' };

    return <span className={`px-3 py-1.5 rounded-[8px] text-[10px] font-bold uppercase tracking-wider ${s.color}`}>{s.text}</span>;
};

export const ClientDashboard = ({ onOpenConfigurator, onBack }) => {
    const { currentUser, logout, clientSubRole, cartItem, clearCart } = useConfigurator();
    const [activeTab, setActiveTab] = useState(cartItem ? 'cart' : 'catalog');

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (activeTab === 'orders' && currentUser) {
            setOrdersLoading(true);
            fetchUserOrders(currentUser.uid).then(data => {
                data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
                setOrders(data);
                setOrdersLoading(false);
            });
        }
    }, [activeTab, currentUser]);

    const corporateCatalog = [
        { id: 'c1', name: 'Ежедневник', desc: 'Кастомизация', priceRUB: 1500, img: '/patterns/Notebook.svg', has3D: true },
        { id: 'c2', name: 'Календарь настольный', desc: 'В разработке', priceRUB: 800, img: '/patterns/Calendar.svg', has3D: false },
    ];

    const handleGenerateRenders = () => {
        setIsGenerating(true);
        setTimeout(() => { setCartItem(prev => ({ ...prev, status: 'renders_ready', rendersGenerated: 3 })); setIsGenerating(false); }, 1500);
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

            await addDoc(collection(db, 'Orders'), orderPayload);

            alert(`Дизайн согласован! Заказ оформлен.`);
            clearCart();
            setActiveTab('orders');

        } catch (error) {
            console.error(error);
            alert("Ошибка. Проверьте консоль.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F7FB] font-zen text-[#1a1a1a] flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest">Личный Кабинет</h1>
                        <p className="text-xs font-bold text-gray-500 mt-1 uppercase">{currentUser?.email}</p>
                    </div>
                    <button onClick={() => { logout(); onBack(); }} className="px-6 py-2 border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-50 uppercase tracking-widest transition">Выйти</button>
                </div>

                <div className="max-w-6xl mx-auto px-6 flex gap-8">
                    <TabBtn active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')}>Каталог</TabBtn>
                    <TabBtn active={activeTab === 'cart'} onClick={() => setActiveTab('cart')}>Корзина {cartItem && '🔴'}</TabBtn>
                    <TabBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>Заказы</TabBtn>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
                {activeTab === 'catalog' && (
                    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6">
                        {corporateCatalog.map(prod => (
                            <div key={prod.id} className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex flex-col hover:shadow-xl transition-shadow group">
                                <div className="aspect-square bg-[#F4F7FB] rounded-[12px] mb-4 flex items-center justify-center p-4">
                                    <img src={prod.img} alt={prod.name} className="w-[60%] opacity-80 group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <h3 className="font-black text-lg mb-1">{prod.name}</h3>
                                <p className="text-xs text-gray-500 font-bold mb-4 flex-1">{prod.desc}</p>
                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                                    <span className="font-black text-lg">{prod.priceRUB} ₽</span>
                                    {prod.has3D ? (
                                        <button onClick={onOpenConfigurator} className="px-5 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-[10px] hover:bg-blue-600 transition-colors">В 3D Редактор</button>
                                    ) : (
                                        <button className="px-5 py-3 bg-gray-100 text-gray-400 text-xs font-bold uppercase tracking-widest rounded-[10px] cursor-not-allowed">В разработке</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'cart' && (
                    <div className="animate-fade-in max-w-4xl bg-white rounded-[24px] p-8 border border-gray-200 shadow-lg">
                        {!cartItem ? (
                            <p className="text-center text-gray-400 font-bold uppercase tracking-widest py-10">Корзина пуста</p>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div><h3 className="font-black text-xl">{cartItem.productName}</h3><p className="text-sm text-gray-500 font-bold mt-1">{cartItem.design}</p></div>
                                    <span className="font-black text-2xl">{cartItem.priceRUB} ₽</span>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-[16px] mb-8 border border-gray-100">
                                    <div className="flex justify-between mb-4"><h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest">Визуализация</h4></div>
                                    {cartItem.status === 'draft' ? (
                                        <button onClick={handleGenerateRenders} disabled={isGenerating} className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-600 font-bold uppercase tracking-widest rounded-[12px] hover:bg-blue-50 transition">
                                            {isGenerating ? 'Генерация...' : `Сгенерировать изображения (Рендеры)`}
                                        </button>
                                    ) : (
                                        <p className="text-xs text-green-600 font-bold bg-green-50 px-3 py-2 rounded-[8px]">✅ Файлы (рендеры) успешно сгенерированы. Проверьте дизайн.</p>
                                    )}
                                </div>

                                <button onClick={handleApprove} disabled={cartItem.status === 'draft'} className={`w-full py-4 text-white font-bold uppercase tracking-widest rounded-[12px] transition-all ${cartItem.status === 'draft' ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-blue-600 shadow-lg'}`}>
                                    Оформить заказ
                                </button>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-black uppercase mb-6">Мои заказы</h2>
                        <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 overflow-hidden">
                            {ordersLoading ? (
                                <p className="p-6 text-center text-gray-400 font-bold">Загрузка...</p>
                            ) : orders.length === 0 ? (
                                <p className="p-6 text-center text-gray-400 font-bold">Нет заказов</p>
                            ) : (
                                orders.map(order => (
                                    <div key={order.id} className="p-6 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex flex-col"><span className="font-black text-lg">#{order.id.substring(0,6).toUpperCase()}</span><span className="text-xs text-gray-400 font-bold">{order.date}</span></div>
                                        <div className="flex-1 px-8 font-bold">{order.product} <span className="text-gray-400 font-normal">({order.design})</span></div>
                                        <div className="flex items-center gap-6"><span className="font-black">{order.price} ₽</span><OrderStatus status={order.status} /></div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}