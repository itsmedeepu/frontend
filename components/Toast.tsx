import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl border 
            animate-in slide-in-from-right-10 fade-in duration-300
            ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
              toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 
              'bg-blue-50 border-blue-100 text-blue-800'}
          `}
        >
          {toast.type === 'success' && <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />}
          {toast.type === 'info' && <Info className="h-6 w-6 text-blue-600 shrink-0" />}
          
          <p className="font-bold text-sm tracking-tight">{toast.message}</p>
          
          <button 
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-2"
          >
            <X className="h-4 w-4 opacity-50" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
