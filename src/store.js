import { create } from 'zustand'

export const useConfigurator = create((set) => ({
    activeProduct: 'notebook',

    // --- Параметры 3D модели ---
    bindingType: 'hard',
    format: 'A5',
    isNotebookOpen: false,
    paperPattern: 'blank',
    coverColor: '#1a1a1a',
    hasElastic: true,
    elasticColor: '#1a1a1a',
    spiralColor: '#Silver',
    logoTexture: null,
    logoPosition: [0, 0],
    zoomLevel: 1,

    // --- AUTH STATE ---
    currentUser: null,
    userRole: null, // 'client' | 'dealer'

    // --- НОВЫЕ ПАРАМЕТРЫ ДЛЯ CLIENT DASHBOARD ---
    // Роль внутри компании: 'PL' (сотрудник), 'PKL' (физлицо), 'KL' / 'KPR' / 'PR' (компания)
    clientSubRole: 'PL',
    tokenBalance: 500, // Баланс токенов для ПЛ/КЛ

    authLoading: true,

    // --- AUTH ACTIONS ---
    setCurrentUser: (user) => set({ currentUser: user }),
    setUserRole: (role) => set({ userRole: role }),
    setAuthLoading: (isLoading) => set({ authLoading: isLoading }),
    logout: () => set({ currentUser: null, userRole: null }),

    // --- НОВЫЕ ACTIONS ДЛЯ КЛИЕНТОВ ---
    setClientSubRole: (subRole) => set({ clientSubRole: subRole }),
    spendTokens: (amount) => set((state) => ({ tokenBalance: Math.max(0, state.tokenBalance - amount) })),

    // --- ACTIONS 3D ---
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