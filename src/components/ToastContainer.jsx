import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-5 right-4 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none">
      {toasts.map((toast) => {
        const styles = {
          success: {
            wrap: 'bg-emerald-950 text-white border-emerald-800',
            icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          },
          error: {
            wrap: 'bg-rose-950 text-white border-rose-800',
            icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
          },
          warning: {
            wrap: 'bg-amber-950 text-white border-amber-800',
            icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
          },
          info: {
            wrap: 'bg-neutral-900 text-white border-zinc-800',
            icon: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
          },
        }[toast.type || 'info'];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-2xl border shadow-xl text-xs font-medium animate-in slide-in-from-right duration-200 ${styles.wrap}`}
          >
            <div className="mt-0.5">{styles.icon}</div>
            <div className="flex-1 min-w-0">
              {toast.title && <p className="font-bold text-white leading-tight">{toast.title}</p>}
              <p className="text-zinc-200 leading-snug mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-400 hover:text-white p-0.5 rounded transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
