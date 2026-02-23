"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastMessage {
  id: number;
  text: string;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  show: (text: string, action?: ToastMessage["action"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = useCallback(
    (text: string, action?: ToastMessage["action"]) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, text, action }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9996] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-white border border-black/10 text-brown px-5 py-3 rounded-xl shadow-soft-lg flex items-center gap-3 pointer-events-auto"
            >
              <span className="text-sm font-body">{toast.text}</span>
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="text-gold text-sm font-semibold hover:underline whitespace-nowrap"
                >
                  {toast.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
