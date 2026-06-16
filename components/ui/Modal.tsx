'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'accent';
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({
  isOpen, onClose, onConfirm, title, children,
  confirmText = 'Confirm', cancelText = 'Cancel',
  confirmVariant = 'primary', loading, size = 'md',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }[size];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={cn('bg-white rounded-2xl shadow-2xl w-full animate-slide-up', sizeClass)}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {children && (
          <div className="px-6 py-5 text-sm text-gray-600">{children}</div>
        )}

        {/* Footer */}
        {onConfirm && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <Button variant="ghost" onClick={onClose}>{cancelText}</Button>
            <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
