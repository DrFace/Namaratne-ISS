import { useEffect } from 'react';
import { router } from '@inertiajs/react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey;
        const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey;
        const altMatch = shortcut.altKey === undefined || shortcut.altKey === event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          // Don't trigger if user is typing in an input
          const target = event.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            if (event.key !== '/' && event.key !== 'Escape') {
              continue;
            }
          }

          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

import { useGlobalStore } from '@/store/globalStore';

// Common keyboard shortcuts
export const useGlobalShortcuts = () => {
  const { setHelpModalOpen } = useGlobalStore();

  useKeyboardShortcuts([
    {
      key: '?',
      description: 'Show help modal',
      action: () => setHelpModalOpen(true),
    },
    {
      key: '/',
      description: 'Focus search',
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[name="search"]');
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      key: 'n',
      ctrlKey: true,
      description: 'New item (Ctrl+N)',
      action: () => {
        // Try to find and click "New" or "Add" button
        const newButton = document.querySelector<HTMLButtonElement>('[data-shortcut="new"], button:has-text("New")');
        if (newButton) {
          newButton.click();
        }
      },
    },
    {
      key: 'Escape',
      description: 'Close modal or cancel',
      action: () => {
        // Find and click close/cancel buttons
        const closeButton = document.querySelector<HTMLButtonElement>('[data-shortcut="close"], [data-shortcut="cancel"]');
        if (closeButton) {
          closeButton.click();
        }
      },
    },
    {
      key: 'd',
      ctrlKey: true,
      description: 'Go to Dashboard (Ctrl+D)',
      action: () => {
        router.visit('/dashboard');
      },
    },
    {
      key: 'i',
      ctrlKey: true,
      description: 'Go to Inventory (Ctrl+I)',
      action: () => {
        router.visit('/inventory');
      },
    },
    {
      key: 'b',
      ctrlKey: true,
      description: 'Go to Billing (Ctrl+B)',
      action: () => {
        router.visit('/billing');
      },
    },
  ]);
};

export default useKeyboardShortcuts;
