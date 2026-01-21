import { create } from 'zustand'
import { auth, getUserRole } from './firebase'
import { signOut } from 'firebase/auth'

export const useConfigurator = create((set) => ({
    // ... Твои старые стейты (format, color и т.д.) оставь как были ...
    activeProduct: 'notebook',
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

    // === AUTH STATE (НОВОЕ) ===
    currentUser: null, // Объект юзера
    userRole: null,    // 'client' | 'dealer'
    authLoading: true, // Идет ли загрузка

    // AUTH ACTIONS
    setCurrentUser: (user) => set({ currentUser: user }),
    setUserRole: (role) => set({ userRole: role }),
    setAuthLoading: (isLoading) => set({ authLoading: isLoading }),

    logout: async () => {
        await signOut(auth);
        set({ currentUser: null, userRole: null });
    },

    // ... Твои старые actions (setColor, setFormat и т.д.) оставь ниже ...
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