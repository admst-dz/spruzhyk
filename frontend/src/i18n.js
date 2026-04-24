export const translations = {
    ru: {
        constructor: "Конструктор",
        search: "Поиск конструкторов...",
        login: "Войти",
        logout: "Выйти",
        title1: "Спроектируй",
        title2: "идеальный ежедневник",
        subtitle: "Цвета, переплёт, тиснение — собери в три клика и получи готовый макет.",
        notebook: "Ежедневник",
        notebookDesc: "A5 • Hardcover",
        calendar: "Календарь",
        calendarDesc: "Перекидной • 12 мес",
        sketchbook: "Блокнот",
        sketchbookDesc: "A5 • 100 г/м²",
        openBtn: "Открыть конструктор →",
    },
    en: {
        constructor: "Configurator",
        search: "Search configurators...",
        login: "Log in",
        logout: "Log out",
        title1: "Design your",
        title2: "perfect notebook",
        subtitle: "Colors, binding, embossing — assemble in three clicks and get a ready-made layout.",
        notebook: "Notebook",
        notebookDesc: "A5 • Hardcover",
        calendar: "Calendar",
        calendarDesc: "Flip • 12 months",
        sketchbook: "Notepad",
        sketchbookDesc: "A5 • 100 g/m²",
        openBtn: "Open configurator →",
    },
    by: {
        constructor: "Канструктар",
        search: "Пошук канструктараў...",
        login: "Увайсці",
        logout: "Выйсці",
        title1: "Спраектуй",
        title2: "ідэальны дзённік",
        subtitle: "Колеры, пераплёт, цісненне — збяры ў тры клікі і атрымай гатовы макет.",
        notebook: "Дзённік",
        notebookDesc: "A5 • Цвёрдая вокладка",
        calendar: "Каляндар",
        calendarDesc: "Перакідны • 12 мес",
        sketchbook: "Блакнот",
        sketchbookDesc: "A5 • 100 г/м²",
        openBtn: "Адкрыць канструктар →",
    }
};

// Функция-помощник для перевода
export const t = (lang, key) => {
    return translations[lang]?.[key] || translations['ru'][key] || key;
};