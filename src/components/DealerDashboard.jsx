import React, { useState, useEffect } from 'react';
import { useConfigurator } from "../store";

export const DealerDashboard = ({ onBack }) => {
    const { currentUser, logout } = useConfigurator();

    // Навигация по админке
    const [activeTab, setActiveTab] = useState('orders'); // orders, clients, quotes, factories, profile

    // --- МОК-ДАННЫЕ (Пока не подключен полноценный бэкенд) ---
    const mockOrders = [
        { id: 'hKsFZM', date: '01.02.2026', client: 'ООО ТехАльянс (КЛ)', details: 'Ежедневник (A5), Пружина', quantity: 50, status: 'production' },
        { id: 'Jq7awy', date: '23.01.2026', client: 'ИП Смирнов (КПР)', details: 'Календарь настольный', quantity: 100, status: 'new' },
    ];

    const mockClients = [
        { id: '1', name: 'ООО ТехАльянс', type: 'КЛ', status: 'Активен', orders: 12 },
        { id: '2', name: 'ИП Смирнов', type: 'КПР', status: 'Активен', orders: 3 },
        { id: '3', name: 'Рекламное Агентство "Пиксель"', type: 'ПР', status: 'Ожидает КП', orders: 0 },
    ];

    const mockLeads = [
        { id: 'L1', name: 'Запрос с сайта (СР)', contact: '+7 (999) 123-45-67', interest: 'Ежедневники тираж 500шт' },
    ];

    const mockFactories = [
        { id: 'F1', name: 'Первая Картонажная Фабрика', rating: '4.9', active: true },
        { id: 'F2', name: 'Типография "Печатный Двор"', rating: '4.7', active: false },
    ];

    return (
        <div className="flex h-screen bg-[#F0F2F5] font-zen text-[#1a1a1a] overflow-hidden">

            {/* === БОКОВОЕ МЕНЮ (SIDEBAR) === */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 shrink-0">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-black tracking-widest uppercase">КАБИНЕТ ДИЛЕРА</h1>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">{currentUser?.email || 'dealer@mail.com'}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <SidebarItem icon="📦" label="Заказы" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                    <SidebarItem icon="👥" label="Клиенты и Лиды" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
                    <SidebarItem icon="📄" label="КП и Эмуляция" active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} />
                    <SidebarItem icon="🏭" label="Производства" active={activeTab === 'factories'} onClick={() => setActiveTab('factories')} />
                    <SidebarItem icon="⚙️" label="Профиль и CRM" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={logout} className="w-full py-3 text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-[12px] transition-colors">
                        Выйти из аккаунта
                    </button>
                </div>
            </aside>

            {/* === ОСНОВНАЯ ОБЛАСТЬ === */}
            <main className="flex-1 overflow-y-auto relative">
                <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32">

                    {/* --- ВКЛАДКА: ЗАКАЗЫ --- */}
                    {activeTab === 'orders' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-black uppercase">Управление заказами</h2>
                                {/* Кнопка эмуляции клиента */}
                                <button className="px-6 py-3 bg-black text-white rounded-[12px] text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition shadow-lg">
                                    + Оформить за клиента
                                </button>
                            </div>

                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden">
                                <div className="grid grid-cols-6 gap-4 p-6 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                                    <span className="col-span-1">ID / Дата</span>
                                    <span className="col-span-2">Клиент</span>
                                    <span className="col-span-2">Детали заказа</span>
                                    <span className="col-span-1 text-right">Действия</span>
                                </div>
                                {mockOrders.map(order => (
                                    <div key={order.id} className="p-6 border-b border-gray-50 hover:bg-gray-50 transition-colors grid grid-cols-6 gap-4 items-center">
                                        <div className="col-span-1 flex flex-col">
                                            <span className="font-black text-lg">#{order.id}</span>
                                            <span className="text-xs font-bold text-gray-400">{order.date}</span>
                                        </div>
                                        <div className="col-span-2 font-bold">{order.client}</div>
                                        <div className="col-span-2 flex flex-col">
                                            <span className="font-bold">{order.details}</span>
                                            <span className="text-xs text-gray-500 font-bold">Тираж: {order.quantity} шт.</span>
                                        </div>
                                        <div className="col-span-1 flex flex-col items-end gap-2">
                                            <StatusBadge status={order.status} />
                                            {/* Документы БСО */}
                                            <button className="text-[10px] uppercase font-bold text-blue-600 hover:underline">
                                                Скачать БСО / Документы
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- ВКЛАДКА: КЛИЕНТЫ И ЛИДЫ --- */}
                    {activeTab === 'clients' && (
                        <div className="animate-fade-in space-y-8">

                            {/* Блок Лидов (С платформы) */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-black uppercase text-blue-600">Новые Лиды от платформы</h2>
                                    <button className="text-sm font-bold text-gray-500 underline">Экспорт в CRM</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mockLeads.map(lead => (
                                        <div key={lead.id} className="p-6 bg-blue-50 border border-blue-100 rounded-[20px] flex justify-between items-center">
                                            <div>
                                                <p className="font-black text-lg">{lead.name}</p>
                                                <p className="text-sm text-gray-600">{lead.contact}</p>
                                                <p className="text-xs font-bold text-blue-800 mt-2 bg-blue-100 inline-block px-2 py-1 rounded">{lead.interest}</p>
                                            </div>
                                            <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded-lg shadow hover:bg-blue-700 transition">
                                                Взять в работу
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* База клиентов */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-black uppercase">Ваша база (КЛ / КПР / ПР)</h2>
                                    <button className="px-6 py-2 border-2 border-black rounded-[12px] text-sm font-bold uppercase hover:bg-black hover:text-white transition">
                                        + Привязать клиента
                                    </button>
                                </div>
                                <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden">
                                    {mockClients.map(client => (
                                        <div key={client.id} className="p-6 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400">
                                                    {client.type}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{client.name}</p>
                                                    <p className="text-xs text-gray-500 font-bold">Успешных заказов: {client.orders}</p>
                                                </div>
                                            </div>
                                            <button className="text-sm font-bold text-gray-400 hover:text-black transition">Подробнее →</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* --- ВКЛАДКА: КП (Коммерческие предложения) --- */}
                    {activeTab === 'quotes' && (
                        <div className="animate-fade-in flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-3xl font-black uppercase mb-2">Генерация КП</h2>
                                    <p className="text-sm text-gray-500 font-bold leading-relaxed">
                                        Сформируйте КП для незарегистрированного клиента.
                                        Система автоматически создаст ему гостевой аккаунт и привяжет к вашему профилю дилера.
                                    </p>
                                </div>

                                <div className="bg-white p-8 rounded-[24px] border border-gray-200 shadow-sm space-y-6">
                                    <InputGroup label="Email клиента (для отправки и авторегистрации)" placeholder="client@mail.com" />
                                    <InputGroup label="Название компании клиента" placeholder="ООО Будущий Партнер" />

                                    <div className="p-4 bg-gray-50 rounded-[12px] border border-gray-200">
                                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-4">Конфигурация изделия для КП</h3>
                                        <button className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-[12px] hover:bg-gray-100 transition">
                                            + Открыть 3D Конфигуратор
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup label="Ваша цена (₽)" placeholder="0.00" type="number" />
                                        <InputGroup label="Количество токенов (ТК)" placeholder="Опционально" type="number" />
                                    </div>

                                    <button className="w-full py-4 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-[12px] hover:bg-gray-800 transition shadow-lg mt-4">
                                        Сгенерировать PDF и Отправить
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- ВКЛАДКА: ПРОИЗВОДСТВА --- */}
                    {activeTab === 'factories' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-black uppercase">Список ПРОИЗ</h2>
                                <button className="px-6 py-2 border-2 border-black rounded-[12px] text-sm font-bold uppercase hover:bg-black hover:text-white transition">
                                    Отправить запрос на партнерство
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mockFactories.map(factory => (
                                    <div key={factory.id} className={`p-6 rounded-[24px] border-2 transition-all ${factory.active ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-black text-xl w-2/3">{factory.name}</h3>
                                            <span className="px-3 py-1 bg-white rounded-lg shadow-sm text-xs font-bold flex items-center gap-1">
                                                ⭐ {factory.rating}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 mb-6">Печать блоков, тиснение, сборка Wire-O.</p>
                                        {factory.active ? (
                                            <span className="text-green-700 font-bold text-sm bg-green-100 px-3 py-1.5 rounded-lg">Ваш партнер (Интеграция активна)</span>
                                        ) : (
                                            <button className="px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded-lg hover:bg-gray-800 transition">
                                                Подключить производство
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- ВКЛАДКА: ПРОФИЛЬ --- */}
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in max-w-3xl">
                            <h2 className="text-3xl font-black uppercase mb-6">Настройки Дилера</h2>

                            <div className="bg-white p-8 rounded-[24px] border border-gray-200 shadow-sm space-y-8">

                                {/* Публичная инфа */}
                                <div>
                                    <h3 className="text-lg font-bold mb-4">Карточка Дилера (Для платформы)</h3>
                                    <div className="space-y-4">
                                        <InputGroup label="Название компании" placeholder="Название" />
                                        <InputGroup label="Описание для Клиентов (КЛ/КПР)" placeholder="Почему стоит работать с нами..." isTextarea />
                                        <InputGroup label="Описание для Производств (ПРОИЗ)" placeholder="Объемы, специфика заказов..." isTextarea />
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Интеграции */}
                                <div>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span>Интеграция с CRM</span>
                                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">Bitrix24 / AmoCRM</span>
                                    </h3>
                                    <p className="text-xs text-gray-500 font-bold mb-4">Сюда будут автоматически отправляться лиды и статусы заказов.</p>
                                    <InputGroup label="Webhook URL (Inbound)" placeholder="https://ваша-crm.ru/webhook/..." />
                                </div>

                                <button className="w-full py-4 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-[12px] hover:bg-gray-800 transition shadow-lg">
                                    Сохранить изменения
                                </button>

                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-5 py-4 rounded-[16px] transition-all duration-200 text-left ${
            active ? 'bg-black text-white shadow-lg scale-100' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
        }`}
    >
        <span className="text-xl">{icon}</span>
        <span className="font-bold text-sm tracking-wide uppercase">{label}</span>
    </button>
)

const InputGroup = ({ label, placeholder, type = "text", isTextarea = false }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 tracking-widest">{label}</label>
        {isTextarea ? (
            <textarea placeholder={placeholder} className="w-full p-4 bg-[#F9F9F9] border border-gray-200 rounded-[14px] text-[#1a1a1a] font-bold focus:outline-none focus:ring-2 focus:ring-black/10 resize-none h-24"/>
        ) : (
            <input type={type} placeholder={placeholder} className="w-full p-4 bg-[#F9F9F9] border border-gray-200 rounded-[14px] text-[#1a1a1a] font-bold focus:outline-none focus:ring-2 focus:ring-black/10"/>
        )}
    </div>
)

const StatusBadge = ({ status }) => {
    const styles = { new: 'bg-gray-200 text-black', production: 'bg-blue-100 text-blue-900', done: 'bg-green-100 text-green-900' };
    const labels = { new: 'Новый', production: 'В производстве', done: 'Готов' };
    return <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide ${styles[status]}`}>{labels[status]}</span>;
}