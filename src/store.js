import { create } from 'zustand'

export const useConfigurator = create((set) => ({
    activeProduct: 'notebook',

    // Параметры
    bindingType: 'hard', // 'hard' | 'spiral'
    format: 'A5',
    isNotebookOpen: false,
    paperPattern: 'blank',
    coverColor: '#1a1a1a',

    // Резинка
    hasElastic: true,
    elasticColor: '#1a1a1a',

    // Пружина (НОВОЕ)
    spiralColor: '#Silver',

    logoTexture: null,
    logoPosition: [0, 0],
    zoomLevel: 1,

    // Actions
    setProduct: (type) => set({ activeProduct: type }),
    setBindingType: (type) => set({ bindingType: type }),
    setFormat: (fmt) => set({ format: fmt }),
    setColor: (part, color) => set((state) => ({ ...state, [`${part}Color`]: color })), // cover, elastic, spiral
    setHasElastic: (has) => set({ hasElastic: has }),
    setNotebookOpen: (isOpen) => set({ isNotebookOpen: isOpen }),
    setPaperPattern: (pattern) => set({ paperPattern: pattern, isNotebookOpen: true }),
    setLogo: (file) => {
        if (file instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => set({ logoTexture: e.target.result });
            reader.readAsDataURL(file);
        }
    },
    setLogoPosition: (x, y) => set({ logoPosition: [x, y] }),
    setZoom: (val) => set({ zoomLevel: val }),
}))