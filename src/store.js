import { create } from 'zustand'

export const useConfigurator = create((set) => ({
    activeProduct: 'notebook', // 'notebook' | 'calendar'

    // --- Ежедневник ---
    format: 'A5',            // 'A5' | 'A6'
    isNotebookOpen: false,   // Открыт или закрыт
    paperPattern: 'blank',   // 'blank', 'lined', 'grid', 'dotted'

    // --- Общие параметры (Цвета и Материалы) ---
    coverColor: '#1a1a1a',   // Цвет обложки

    // Резинка
    hasElastic: true,
    elasticColor: '#1a1a1a',

    // Логотип
    logoTexture: null,
    logoPosition: [0, 0],    // x, y координаты

    // --- Действия (Actions) ---
    setProduct: (type) => set({ activeProduct: type }),

    setFormat: (fmt) => set({ format: fmt }),

    setColor: (part, color) => set((state) => ({ ...state, [`${part}Color`]: color })),

    setHasElastic: (has) => set({ hasElastic: has }),

    setNotebookOpen: (isOpen) => set({ isNotebookOpen: isOpen }),

    setPaperPattern: (pattern) => {
        // При выборе бумаги автоматически открываем книгу
        set({ paperPattern: pattern, isNotebookOpen: true })
    },

    setLogo: (file) => {
        if (file instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => set({ logoTexture: e.target.result });
            reader.readAsDataURL(file);
        }
    },

    setLogoPosition: (x, y) => set({ logoPosition: [x, y] }),
}))