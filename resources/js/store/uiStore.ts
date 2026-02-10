import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  shortcutsHelpOpen: boolean;
  setShortcutsHelpOpen: (open: boolean) => void;
  toggleShortcutsHelp: () => void;
  
  helpModalOpen: boolean;
  setHelpModalOpen: (open: boolean) => void;
  toggleHelpModal: () => void;
  
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  activeSearchQuery: string;
  setActiveSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  shortcutsHelpOpen: false,
  setShortcutsHelpOpen: (open) => set({ shortcutsHelpOpen: open }),
  toggleShortcutsHelp: () => set((state) => ({ shortcutsHelpOpen: !state.shortcutsHelpOpen })),
  
  helpModalOpen: false,
  setHelpModalOpen: (open) => set({ helpModalOpen: open }),
  toggleHelpModal: () => set((state) => ({ helpModalOpen: !state.helpModalOpen })),
  
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  activeSearchQuery: '',
  setActiveSearchQuery: (query) => set({ activeSearchQuery: query }),
}));
