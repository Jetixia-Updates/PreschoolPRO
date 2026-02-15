"use client";

import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = Math.random().toString(36).slice(2);
      const toast: Toast = { id, type, title, description };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const success = useCallback(
    (title: string, description?: string) =>
      addToast("success", title, description),
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) =>
      addToast("error", title, description),
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string) =>
      addToast("info", title, description),
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string) =>
      addToast("warning", title, description),
    [addToast]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, success, error, info, warning, dismiss };
}
