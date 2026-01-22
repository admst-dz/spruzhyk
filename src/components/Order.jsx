import React, { useState } from 'react';
import { useConfigurator } from "../store";
import { createOrder } from "../firebase"; // Импорт функции

export const Order = ({ onBack }) => {
    const {
        // Параметры продукта из стора
        activeProduct, format, coverColor, elasticColor, hasElastic,
        paperPattern, logoTexture, bindingType, spiralColor,
        currentUser // Данные юзера (если залогинен)
    } = useConfigurator();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Данные формы
    const [clientType, setClientType] = useState('phys');
    const [quantity, setQuantity] = useState(1);
    const [isSample, setIsSample] = useState(false);

    // Стейт для текстовых полей
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '',
        address: '', inn: '', contactPerson: '', comment: ''
    });

    // Обработчик ввода
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ГЛАВНАЯ ФУНКЦИЯ: ОТПРАВКА ЗАКАЗА
    const handleSubmit = async () => {
        // Простейшая валидация
        if (!formData.name || !formData.phone) {
            alert("Пожалуйста, заполните Имя и Телефон");
            return;
        }

        setLoading(true);

        const orderPayload = {
            // Кто заказал (user ID или 'guest')
            userId: currentUser ? currentUser.uid : 'guest',
            userEmail: currentUser ? currentUser.email : (formData.email || 'guest'),

            // Данные клиента из формы
            clientType,
            clientInfo: formData,

            // Параметры продукта (Сборка всего конфига)
            productConfig: {
                type: activeProduct,
                format,
                coverColor,
                bindingType,
                hasElastic,
                elasticColor: hasElastic ? elasticColor : null,
                spiralColor: bindingType === 'spiral' ? spiralColor : null,
                paperPattern,
                hasLogo: !!logoTexture
            },

            // Параметры тиража
            quantity,
            isSample: clientType === 'jur' ? isSample : false,
            amount: 'Рассчитывается менеджером' // Пока заглушка цены
        };

        try {
            await createOrder(orderPayload);
            setSuccess(true); // Показываем экран успеха
        } catch (error) {
            alert("Ошибка при отправке: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // ЭКРАН УСПЕХА
    if (success) {
        return (
            <div className="fixed inset-0 w-full h-full bg-[#E5E5E5] flex flex-col items-center justify-center font-zen z-50">
                <div className="bg-white p-10 rounded-[20px] shadow-2xl text-center max-w-md animate-fade-in">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-3xl font-black text-black mb-2">ЗАКАЗ ОТПРАВЛЕН</h2>
                    <p className="text-gray-500 font-bold mb-8">Менеджер свяжется с вами в ближайшее время для подтверждения.</p>
                    <button onClick={onBack} className="w-full py-4 bg-black text-white rounded-[12px] font-bold uppercase tracking-widest hover:bg-gray-800 transition">
                        Вернуться в меню
                    </button>
                </div>
            </div>
        )
    }

    const patternNames = { blank: 'Пустой', lined: 'Линейка', grid: 'Клетка', dotted: 'Точка' };
    const bindingNames = { hard: 'Твердый', spiral: 'На пружине' };

    return (
        <div className="fixed inset-0 w-full h-full bg-[#E5E5E5] font-zen overflow-y-auto z-50 text-black">

            <div className="p-6 md:p-8 flex items-center sticky top-0 bg-[#E5E5E5]/90 backdrop-blur-md z-30">
                <button onClick={onBack} className="flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-md text-sm font-bold text-black hover:scale-105 transition-transform border border-black/5">← Назад</button>
            </div>

            <div className="flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 md:px-8 gap-8 md:gap-16 pb-32 mt-4">

                {/* ЛЕВАЯ КОЛОНКА (ПРЕВЬЮ) */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <h2 className="text-2xl md:text-3xl font-black uppercase">Ваш макет</h2>
                    <div className="bg-white p-6 rounded-[20px] shadow-xl flex flex-col gap-6 border border-white/50">
                        <div className="flex gap-4 h-64">
                            {/* CSS Визуализация */}
                            <div className="flex-1 rounded-[12px] shadow-inner relative overflow-hidden border border-black/5" style={{ backgroundColor: coverColor }}>
                                {hasElastic && (<div className="absolute top-0 right-[20%] w-4 h-full shadow-sm z-10" style={{ backgroundColor: elasticColor }} />)}
                                {logoTexture && (<div className="absolute bottom-6 right-6 text-white/50 text-xs font-bold border border-white/50 px-2 py-1 rounded">LOGO</div>)}
                                <div className="absolute bottom-2 left-2 text-white/60 text-[10px] font-bold tracking-wider">ОБЛОЖКА</div>
                                {bindingType === 'spiral' && (
                                    <div className="absolute left-0 top-0 h-full w-5 flex flex-col justify-evenly pl-1 bg-black/5 border-r border-black/5">
                                        {[1,2,3,4,5,6,7].map(i => <div key={i} className="w-3.5 h-2 rounded-full border border-black/20 shadow-sm ml-0.5" style={{backgroundColor: spiralColor === '#Silver' ? '#e0e0e0' : spiralColor}}/>)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 bg-white border border-gray-200 rounded-[12px] relative flex items-center justify-center">
                                {/* Иконка блока (упрощенная) */}
                                <div className="text-center">
                                    <span className="text-2xl font-black block text-gray-200">{paperPattern.toUpperCase()}</span>
                                </div>
                                <div className="absolute bottom-2 left-2 text-gray-400 text-[10px] font-bold tracking-wider">БЛОК</div>
                            </div>
                        </div>
                        <div className="space-y-3 border-t border-gray-100 pt-5 text-sm font-bold">
                            <Row label="Переплет" value={bindingNames[bindingType]} />
                            {bindingType === 'spiral' && <Row label="Пружина" value={<ColorDot color={spiralColor} />} />}
                            <Row label="Формат" value={format} />
                            <Row label="Обложка" value={<ColorDot color={coverColor} />} />
                            <Row label="Резинка" value={hasElastic ? <ColorDot color={elasticColor} /> : 'Нет'} />
                            <Row label="Разлиновка" value={patternNames[paperPattern]} />
                        </div>
                    </div>
                </div>

                {/* ПРАВАЯ КОЛОНКА (ФОРМА) */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    <h2 className="text-2xl md:text-3xl font-black uppercase">Оформление</h2>
                    <div className="bg-white p-6 md:p-10 rounded-[20px] shadow-xl flex flex-col gap-8 border border-white/50">

                        <div className="bg-gray-100 p-1.5 rounded-[14px] flex shadow-inner">
                            <button onClick={() => setClientType('phys')} className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-widest rounded-[12px] transition-all ${clientType === 'phys' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}>Физ. Лицо</button>
                            <button onClick={() => setClientType('jur')} className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-widest rounded-[12px] transition-all ${clientType === 'jur' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}>Юр. Лицо</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {clientType === 'phys' ? (
                                <>
                                    <InputGroup label="ФИО" value={formData.name} onChange={(v) => handleChange('name', v)} placeholder="Иванов Иван" />
                                    <InputGroup label="Телефон" value={formData.phone} onChange={(v) => handleChange('phone', v)} placeholder="+7 (999) 000-00-00" />
                                    <InputGroup label="Email" value={formData.email} onChange={(v) => handleChange('email', v)} placeholder="mail@example.com" />
                                    <InputGroup label="Адрес" value={formData.address} onChange={(v) => handleChange('address', v)} placeholder="Город, улица..." />
                                </>
                            ) : (
                                <>
                                    <InputGroup label="Компания" value={formData.name} onChange={(v) => handleChange('name', v)} placeholder='ООО "Компания"' />
                                    <InputGroup label="ИНН" value={formData.inn} onChange={(v) => handleChange('inn', v)} placeholder="1234567890" />
                                    <InputGroup label="Юр. Адрес" value={formData.address} onChange={(v) => handleChange('address', v)} placeholder="Индекс, Город..." />
                                    <InputGroup label="Контакт" value={formData.contactPerson} onChange={(v) => handleChange('contactPerson', v)} placeholder="ФИО менеджера" />
                                    <InputGroup label="Телефон" value={formData.phone} onChange={(v) => handleChange('phone', v)} placeholder="+7..." />
                                    <InputGroup label="Email" value={formData.email} onChange={(v) => handleChange('email', v)} placeholder="corp@mail.ru" />
                                </>
                            )}
                            <div className="md:col-span-2">
                                <InputGroup label="Комментарий" value={formData.comment} onChange={(v) => handleChange('comment', v)} placeholder="Детали..." isTextarea={true} />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 md:items-end justify-between border-t border-gray-100 pt-8 mt-2">
                            <div className="flex flex-col gap-3">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Тираж (шт.)</span>
                                <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-[14px] p-2 border border-gray-200 w-max shadow-sm">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-[10px] shadow-sm font-bold text-xl hover:scale-105 transition">-</button>
                                    <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-16 bg-transparent text-center text-2xl font-black focus:outline-none"/>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-[10px] shadow-sm font-bold text-xl hover:scale-105 transition">+</button>
                                </div>
                            </div>
                            {clientType === 'jur' && (
                                <label className="flex items-center gap-4 cursor-pointer bg-[#EAF4FF] px-5 py-4 rounded-[16px] border border-blue-100 hover:border-blue-300 transition w-full md:w-auto">
                                    <input type="checkbox" checked={isSample} onChange={(e) => setIsSample(e.target.checked)} className="w-6 h-6 border-2 border-blue-300 rounded checked:bg-blue-600" />
                                    <div className="flex flex-col"><span className="font-bold text-[#1e3a8a] text-sm uppercase">Тиражный образец</span><span className="text-[10px] font-bold text-blue-400">Сделать 1 шт.</span></div>
                                </label>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <button className="py-5 rounded-[14px] border-2 border-gray-200 text-gray-500 font-bold uppercase tracking-widest hover:border-gray-400 hover:text-black transition">
                                Консультация
                            </button>

                            {/* КНОПКА ОТПРАВКИ */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="py-5 rounded-[14px] bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {loading ? 'Отправка...' : 'Оформить Заказ →'}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

// Компоненты UI (немного доработаны для приема value/onChange)
const Row = ({ label, value }) => (<div className="flex justify-between items-center py-1"><span className="text-gray-500 font-bold text-xs uppercase tracking-wider">{label}</span><span className="font-bold text-black">{value}</span></div>)
const ColorDot = ({ color }) => (<div className="flex items-center justify-end gap-2"><div className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: color }} /><span className="uppercase text-xs font-black text-black">{color}</span></div>)

const InputGroup = ({ label, placeholder, value, onChange, type = "text", isTextarea = false }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 tracking-widest">{label}</label>
        {isTextarea ? (
            <textarea
                value={value} onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 bg-[#F9F9F9] border border-gray-200 rounded-[14px] text-black font-bold focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all resize-none h-32"
            />
        ) : (
            <input
                type={type} value={value} onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 bg-[#F9F9F9] border border-gray-200 rounded-[14px] text-black font-bold focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all"
            />
        )}
    </div>
)