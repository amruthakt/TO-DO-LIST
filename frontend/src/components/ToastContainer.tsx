import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import type { ToastMessage } from '../types/task.ts';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        return (
          <div
            key={toast.id}
            role={isError ? 'alert' : 'status'}
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              isError
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-blue-200 bg-white text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isError ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
              )}
              <span>{toast.message}</span>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
