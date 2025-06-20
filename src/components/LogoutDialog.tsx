import React, { useEffect, useRef } from 'react';

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutDialog: React.FC<LogoutDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Focus management
    if (confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
    // Keyboard accessibility
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') onConfirm();
    };
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Confirm Logout</h3>
          </div>
          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-gray-700">Are you sure you want to logout? You will need to sign in again to access your account.</p>
          </div>
          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              ref={confirmButtonRef}
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
            >
              Confirm Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutDialog; 