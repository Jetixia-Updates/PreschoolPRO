"use client";

import { X } from "lucide-react";

interface FormDialogProps {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function FormDialog({
  open,
  title,
  description,
  children,
  onClose,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  size = "md",
  loading = false,
}: FormDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-50 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-fade-in`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-gray-50 px-6 py-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Reusable form field wrapper */
export function FormField({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
