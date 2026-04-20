import { create } from 'zustand'

let _webglCanvas = null
export const registerWebGLCanvas = (el) => { _webglCanvas = el }
export const captureRender = () => {
    if (!_webglCanvas) return null
    try { return _webglCanvas.toDataURL('image/png') } catch (e) { return null }
}

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
    logos: [],
    selectedLogoId: null,
    zoomLevel: 1,

    // --- AUTH И РОЛИ ---
    currentUser: null,
    userRole: null,
    clientSubRole: 'PL',
    authLoading: true,

    language: 'ru',
    theme: 'dark',

    cartItem: null,
    renderSnapshot: null,

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
    setRenderSnapshot: (url) => set({ renderSnapshot: url }),

    setProduct: (type) => set({ activeProduct: type }),
    setBindingType: (type) => set({ bindingType: type }),
    setFormat: (fmt) => set({ format: fmt }),
    setColor: (part, color) => set((state) => ({ ...state, [`${part}Color`]: color })),
    setHasElastic: (has) => set({ hasElastic: has }),
    setNotebookOpen: (isOpen) => set({ isNotebookOpen: isOpen }),
    setPaperPattern: (pattern) => set({ paperPattern: pattern, isNotebookOpen: true }),
    addLogo: (file) => {
        if (file instanceof File) {
            const reader = new FileReader();
            const id = Date.now();
            reader.onload = (e) => set((state) => ({
                logos: [...state.logos, { id, texture: e.target.result, filename: file.name, position: [0, 0], rotation: 0, scale: 0.6 }],
                selectedLogoId: id
            }));
            reader.readAsDataURL(file);
        }
    },
    selectLogo: (id) => set({ selectedLogoId: id }),
    setLogoPosition: (x, y) => set((state) => ({
        logos: state.logos.map(l => l.id === state.selectedLogoId ? { ...l, position: [x, y] } : l)
    })),
    setLogoRotation: (rotation) => set((state) => ({
        logos: state.logos.map(l => l.id === state.selectedLogoId ? { ...l, rotation } : l)
    })),
    setLogoScale: (scale) => set((state) => ({
        logos: state.logos.map(l => l.id === state.selectedLogoId ? { ...l, scale } : l)
    })),
    setZoom: (val) => set({ zoomLevel: val }),
}))