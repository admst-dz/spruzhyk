import React, { useState } from 'react';
import { useConfigurator } from "../store";
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ВЫНЕСЕНЫ НАВЕРХ ---
// Это решает проблему "Cannot access before initialization"
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
        done: { text: 'Получено', color: 'bg-green-100 text-green-700' },
        new: { text: 'Ожидает', color: 'bg-gray-100 text-gray-600' }
    }[status] || { text: status, color: 'bg-gray-100 text-gray-600' };

    return <span className={`px-3 py-1.5 rounded-[8px] text-[10px] font-bold uppercase tracking-wider ${s.color}`}>{s.text}</span>;
};

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export const ClientDashboard = ({ onOpenConfigurator, onBack }) => {
    const { currentUser, logout, clientSubRole, tokenBalance, spendTokens } = useConfigurator();
    const [activeTab, setActiveTab] = useState('catalog');

    // Мок-данные
    const companyInfo = { name: 'ООО "ТехАльянс"', role: 'КПР' };
    const corporateCatalog = [
        { id: 'c1', name: 'Ежедневник "Standard"', desc: 'Твердый переплет, А5', priceTK: 30, priceRUB: 1500, img: '/patterns/Notebook.svg', has3D: true },
        { id: 'c2', name: 'Ежедневник "Soft"', desc: 'На пружине, А5', priceTK: 25, priceRUB: 1200, img: '/patterns/Notebook.svg', has3D: true },
        { id: 'c3', name: 'Календарь настольный', desc: 'Стандарт', priceTK: 15, priceRUB: 800, img: '/patterns/Calendar.svg', has3D: false },
    ];
    const [team, setTeam] = useState([
        { id: 1, name: 'Иванов И.И.', role: 'ПЛ (Сотрудник)', tokens: 50 },
        { id: 2, name: 'Петров П.П.', role: 'ПЛ (Сотрудник)', tokens: 0 },
    ]);
    const [cartItem, setCartItem] = useState({
        product: 'Ежедневник "Corporate"', design: 'Обложка: Черная, Блок: Клетка', priceTK: 30, priceRUB: 1500, status: 'draft', rendersGenerated: 0
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [orders, setOrders] = useState([]);

    const isCorporateAdmin = ['KL', 'KPR', 'PR'].includes(clientSubRole);
    const maxRenders = isCorporateAdmin ? 15 : (clientSubRole === 'PKL' ? 3 : 5);

    const handleGenerateRenders = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setCartItem(prev => ({ ...prev, status: 'renders_ready', rendersGenerated: maxRenders }));
            setIsGenerating(false);
        }, 1500);
    };

    const handleApprove = async () => {
        if (clientSubRole === 'PL' && tokenBalance < cartItem.priceTK) return alert("Недостаточно ТК!");

        try {
            const orderPayload = {
                userId: currentUser ? currentUser.uid : 'guest',
                userEmail: currentUser ? currentUser.email : 'user@mail.com',
                role: clientSubRole || 'PL',
                product: cartItem.product,
                design: cartItem.design,
                price: clientSubRole === 'PL' ? cartItem.priceTK : cartItem.priceRUB,
                currency: clientSubRole === 'PL' ? 'TK' : 'RUB',
                status: 'new',
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'Orders'), orderPayload);

            if (clientSubRole === 'PL') {
                spendTokens(cartItem.priceTK);
                if (currentUser) await updateDoc(doc(db, 'Users', currentUser.uid), { tokenBalance: tokenBalance - cartItem.priceTK });
            }

            setOrders(prev => [{ id: docRef.id.substring(0, 6).toUpperCase(), date: new Date().toLocaleDateString(), product: cartItem.product, status: 'processing', price: clientSubRole === 'PL' ? `${cartItem.priceTK} ТК` : `${cartItem.priceRUB} ₽` }, ...prev]);
            alert(`Дизайн согласован! Заказ оформлен.`);
            setCartItem(null);
            setActiveTab('orders');

        } catch (error) {
            console.error("Ошибка оформления:", error);
            alert("Ошибка. Проверьте консоль.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F7FB] font-zen text-[#1a1a1a] flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest">{isCorporateAdmin ? 'Кабинет Компании (КЛ)' : (clientSubRole === 'PKL' ? 'Личный Кабинет' : 'Кабинет Сотрудника')}</h1>
                        <p className="text-xs font-bold text-gray-500 mt-1 uppercase">Роль: {clientSubRole} | {currentUser?.email || 'user@mail.com'}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        {clientSubRole !== 'PKL' && (
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Ваш баланс</span>
                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-[8px] border border-blue-100">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                                    <span className="font-black text-xl text-blue-800">{tokenBalance} <span className="text-sm">ТК</span></span>
                                </div>
                            </div>
                        )}
                        <button onClick={() => { logout(); onBack(); }} className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest">Выйти</button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 flex gap-8">
                    <TabBtn active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')}>Каталог ПРОД</TabBtn>
                    {isCorporateAdmin && <TabBtn active={activeTab === 'team'} onClick={() => setActiveTab('team')}>Сотрудники и Токены</TabBtn>}
                    <TabBtn active={activeTab === 'cart'} onClick={() => setActiveTab('cart')}>Согласование {cartItem && '🔴'}</TabBtn>
                    <TabBtn active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>Заказы</TabBtn>
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
                {/* 1. КАТАЛОГ */}
                {activeTab === 'catalog' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-black uppercase mb-6">Доступная продукция</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {corporateCatalog.map(prod => (
                                <div key={prod.id} className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
                                    <div className="aspect-square bg-[#F4F7FB] rounded-[12px] mb-4 flex items-center justify-center p-4"><img src={prod.img} alt={prod.name} className="w-[60%] opacity-70" /></div>
                                    <h3 className="font-black text-lg leading-tight mb-2">{prod.name}</h3>
                                    <p className="text-xs text-gray-500 font-bold mb-4 flex-1">{prod.desc}</p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                        <span className="font-black text-blue-600">{clientSubRole === 'PKL' ? `${prod.priceRUB} ₽` : `${prod.priceTK} ТК`}</span>
                                        {prod.has3D ? (<button onClick={onOpenConfigurator} className="px-4 py-2 bg-[#1a1a1a] text-white text-xs font-bold uppercase rounded-[8px] hover:bg-blue-600 transition-colors">В 3D Редактор</button>) : (<button className="px-4 py-2 border border-gray-200 text-gray-500 text-xs font-bold uppercase rounded-[8px]">Заказать</button>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. СОТРУДНИКИ */}
                {activeTab === 'team' && isCorporateAdmin && (
                    <div className="animate-fade-in bg-white rounded-[24px] p-8 border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black uppercase">Сотрудники (ПЛ)</h2>
                            <button className="px-4 py-2 border-2 border-black rounded-[8px] text-xs font-bold uppercase">+ Добавить ПЛ</button>
                        </div>
                        <div className="space-y-4">
                            {team.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-[12px]">
                                    <div><p className="font-black">{user.name}</p><p className="text-xs text-gray-500 font-bold">{user.role}</p></div>
                                    <div className="flex items-center gap-4"><span className="font-bold text-blue-600">{user.tokens} ТК</span><button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold shadow-sm">Начислить ТК</button></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. КОРЗИНА / СОГЛАСОВАНИЕ */}
                {activeTab === 'cart' && (
                    <div className="animate-fade-in max-w-4xl">
                        <h2 className="text-2xl font-black uppercase mb-6">Проверка и Утверждение</h2>
                        {!cartItem ? (
                            <div className="bg-white p-10 rounded-[24px] text-center border border-gray-200"><p className="text-gray-400 font-bold uppercase tracking-widest">Корзина пуста</p></div>
                        ) : (
                            <div className="bg-white rounded-[24px] p-8 border border-gray-200 shadow-lg">
                                <div className="flex justify-between items-start mb-6">
                                    <div><h3 className="font-black text-xl">{cartItem.product}</h3><p className="text-sm text-gray-500 font-bold mt-1">{cartItem.design}</p></div>
                                    <span className="font-black text-2xl text-blue-600">{clientSubRole === 'PKL' ? `${cartItem.priceRUB} ₽` : `${cartItem.priceTK} ТК`}</span>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-[16px] mb-8 border border-gray-100">
                                    <div className="flex justify-between mb-4"><h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest">Визуализация для утверждения</h4><span className="text-xs font-bold bg-white px-2 py-1 rounded shadow-sm">{cartItem.rendersGenerated} / {maxRenders} сгенерировано</span></div>
                                    {cartItem.status === 'draft' ? (
                                        <button onClick={handleGenerateRenders} disabled={isGenerating} className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-600 font-bold uppercase rounded-[12px] hover:bg-blue-50 transition">
                                            {isGenerating ? 'Генерация файлов на сервере...' : `Сгенерировать изображения (${maxRenders} ракурсов)`}
                                        </button>
                                    ) : (
                                        <p className="text-xs text-green-600 font-bold bg-green-50 px-3 py-2 rounded-[8px]">✅ Файлы успешно сгенерированы. Проверьте дизайн перед отправкой.</p>
                                    )}
                                </div>

                                {isCorporateAdmin ? (
                                    <div className="space-y-4 border-t border-gray-100 pt-6">
                                        <p className="text-sm font-bold text-gray-500">Для передачи на производство загрузите подписанный бланк согласования.</p>
                                        <div className="flex gap-4">
                                            <button className="px-6 py-4 bg-gray-100 text-black font-bold uppercase rounded-[12px] hover:bg-gray-200 transition">📥 Скачать PDF</button>
                                            <label className="flex-1 py-4 bg-black text-white text-center font-bold uppercase rounded-[12px] cursor-pointer hover:bg-blue-600 transition shadow-lg">Утвердить (Загрузить Скан)<input type="file" className="hidden" onChange={handleApprove}/></label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-t border-gray-100 pt-6 flex justify-end">
                                        <button onClick={handleApprove} disabled={cartItem.status === 'draft'} className={`px-8 py-4 text-white font-bold uppercase rounded-[12px] shadow-lg transition-all ${cartItem.status === 'draft' ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-blue-600'}`}>
                                            {clientSubRole === 'PL' ? 'Согласовать (Оплатить ТК)' : 'Перейти к оплате картой'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. ЗАКАЗЫ */}
                {activeTab === 'orders' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-black uppercase mb-6">История заявок</h2>
                        {orders.length === 0 ? (
                            <p className="text-gray-400 font-bold uppercase">У вас пока нет заказов</p>
                        ) : (
                            <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 overflow-hidden">
                                {orders.map(order => (
                                    <div key={order.id} className="p-6 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 transition">
                                        <div className="flex flex-col gap-1"><span className="font-black text-lg text-black">#{order.id}</span><span className="text-xs font-bold text-gray-400">{order.date}</span></div>
                                        <div className="flex-1 px-8 font-bold text-gray-700">{order.product}</div>
                                        <div className="flex items-center gap-6"><span className="font-black text-blue-600">{order.price}</span><OrderStatus status={order.status} /></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}