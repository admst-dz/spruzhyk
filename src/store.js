import { create } from 'zustand'

export const useConfigurator = create((set) => ({
    activeProduct: 'notebook', // 'notebook' | 'calendar' | 'sketchbook'

    // --- Параметры 3D модели ---
    bindingType: 'hard',
    format: 'A5',
    isNotebookOpen: false,
    paperPattern: 'blank',
    coverColor: '#D2B48C', // Крафтовый по умолчанию для скетчбука
    hasElastic: true,
    elasticColor: '#1a1a1a',
    spiralColor: '#1a1a1a', // Черная пружина по умолчанию для скетчбука
    logoTexture: null,
    logoPosition: [0, 0],
    zoomLevel: 1,

    // --- AUTH И РОЛИ ---
    currentUser: null,
    userRole: null,
    clientSubRole: 'PL',
    authLoading: true,

    language: 'ru',
    theme: 'dark',

    cartItem: null,

    // --- ACTIONS ---
    setCurrentUser: (user) => set({ currentUser: user }),
    setUserRole: (role) => set({ userRole: role }),
    setClientSubRole: (subRole) => set({ clientSubRole: subRole }),
    setAuthLoading: (isLoading) => set({ authLoading: isLoading }),
    logout: () => set({ currentUser: null, userRole: null }),

    setLanguage: (lang) => set({ language: lang }),
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (newTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return { theme: newTheme };
    }),

    addToCart: (itemData) => set({ cartItem: itemData }),
    clearCart: () => set({ cartItem: null }),

    setProduct: (type) => set({ activeProduct: type }),
    setBindingType: (type) => set({ bindingType: type }),
    setFormat: (fmt) => set({ format: fmt }),
    setColor: (part, color) => set((state) => ({ ...state, [`${part}Color`]: color })),
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