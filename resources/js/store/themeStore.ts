import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.darkMode;
        // Update document class
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: newDarkMode };
      }),
      setDarkMode: (dark) => set(() => {
        if (dark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: dark };
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
