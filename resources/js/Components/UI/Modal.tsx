import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Card from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  }[maxWidth];

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-hidden transition-all sm:my-8 w-full ${maxWidthClass}`}>
                <Card className="p-0 border-0 bg-white/90 dark:bg-gray-900/90 shadow-2xl overflow-hidden" animate={false}>
                  {title && (
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-4 md:p-6">
                      <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                        {title}
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 transition-colors"
                        data-shortcut="close"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  )}
                  {!title && (
                    <button
                      onClick={onClose}
                      className="absolute right-4 top-4 z-10 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 transition-colors"
                      data-shortcut="close"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  )}
                  <div className="p-4 md:p-6">
                    {children}
                  </div>
                </Card>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
