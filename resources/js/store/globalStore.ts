import { create } from 'zustand';

interface GlobalState {
    isHelpModalOpen: boolean;
    setHelpModalOpen: (open: boolean) => void;
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
    isHelpModalOpen: false,
    setHelpModalOpen: (open) => set({ isHelpModalOpen: open }),
    isLoading: false,
    setLoading: (loading) => set({ isLoading: loading }),
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
}));
