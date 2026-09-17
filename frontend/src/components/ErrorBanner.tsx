import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ErrorBanner: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 p-4 shadow-sm flex items-start justify-between">
    <div className="flex items-center gap-3">
      <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
      <p className="text-sm font-medium text-rose-800">{message}</p>
    </div>
    <button onClick={onClose} className="text-rose-500 hover:text-rose-700 p-1">
      <X className="h-4 w-4" />
    </button>
  </div>
);
