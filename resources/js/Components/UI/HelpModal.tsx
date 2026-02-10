import React from 'react';
import Modal from './Modal';
import { useGlobalStore } from '@/store/globalStore';
import { LucideCommand, LucideKeyboard } from 'lucide-react';

const HelpModal = () => {
    const { isHelpModalOpen, setHelpModalOpen } = useGlobalStore();

    const shortcuts = [
        { key: '/', desc: 'Focus search input' },
        { key: 'Ctrl + N', desc: 'Create new item' },
        { key: 'Ctrl + D', desc: 'Go to Dashboard' },
        { key: 'Ctrl + I', desc: 'Go to Inventory' },
        { key: 'Ctrl + B', desc: 'Go to Billing' },
        { key: 'Esc', desc: 'Close modal or cancel' },
        { key: '?', desc: 'Show this help modal' },
    ];

    return (
        <Modal
            isOpen={isHelpModalOpen}
            onClose={() => setHelpModalOpen(false)}
            maxWidth="md"
        >
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <LucideKeyboard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Keyboard Shortcuts
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shortcuts.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{s.desc}</span>
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 shadow-sm">
                                {s.key}
                            </kbd>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={() => setHelpModalOpen(false)}
                        className="btn-secondary-premium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default HelpModal;
