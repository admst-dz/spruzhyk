import { create } from 'zustand'

export const useConfigurator = create((set) => ({
    activeProduct: 'notebook',

    // Параметры продукта
    format: 'A5',
    isNotebookOpen: false,
    paperPattern: 'blank',
    coverColor: '#1a1a1a',
    hasElastic: true,
    elasticColor: '#1a1a1a',
    logoTexture: null,
    logoPosition: [0, 0],

    // --- НОВЫЙ ПАРАМЕТР: ЗУМ ---
    zoomLevel: 1, // 1 = 100%

    // Actions
    setProduct: (type) => set({ activeProduct: type }),
    setFormat: (fmt) => set({ format: fmt }),
    setColor: (part, color) => set((state) => ({ ...state, [`${part}Color`]: color })),
    setHasElastic: (has) => set({ hasElastic: has }),
    setNotebookOpen: (isOpen) => set({ isNotebookOpen: isOpen }),
    setPaperPattern: (pattern) => {
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

    // Управление зумом
    setZoom: (val) => set({ zoomLevel: val }),
}))