"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Toast, ToastType } from "@/hooks/use-toast";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
};

const bgColors: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50",
  error: "border-red-200 bg-red-50",
  info: "border-blue-200 bg-blue-50",
  warning: "border-amber-200 bg-amber-50",
};

export function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-fade-in min-w-[320px] max-w-[420px]",
            bgColors[toast.type]
          )}
        >
          <div className="mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{toast.title}</p>
            {toast.description && (
              <p className="text-sm text-gray-600 mt-0.5">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
