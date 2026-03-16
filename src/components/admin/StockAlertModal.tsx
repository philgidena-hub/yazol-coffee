"use client";

import { motion, AnimatePresence } from "framer-motion";

interface InsufficientItem {
  ingredientName: string;
  needed: number;
  available: number;
  unit: string;
}

interface StockAlertModalProps {
  open: boolean;
  items: InsufficientItem[];
  onClose: () => void;
  onGoToInventory?: () => void;
}

export default function StockAlertModal({
  open,
  items,
  onClose,
  onGoToInventory,
}: StockAlertModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-sm w-full mx-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Can&apos;t Approve Order</h3>
                <p className="text-xs text-slate-400">These ingredients need restocking</p>
              </div>
            </div>

            {/* Items list */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 divide-y divide-slate-700/50 mb-4 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.ingredientName} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-sm text-slate-200">{item.ingredientName}</span>
                  <span className="text-xs text-red-400 font-medium tabular-nums">
                    {item.available}{item.unit} / {item.needed}{item.unit} needed
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
              {onGoToInventory && (
                <button
                  onClick={onGoToInventory}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Go to Inventory
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
