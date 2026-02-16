"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem } from "@/lib/dynamodb";

interface InventoryItemFormProps {
  open: boolean;
  item: InventoryItem | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

const UNITS = ["g", "ml", "pc", "pods", "sticks", "oz", "cups"];

export default function InventoryItemForm({ open, item, onClose, onSaved }: InventoryItemFormProps) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("g");
  const [currentStock, setCurrentStock] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && item) {
      setName(item.name);
      setUnit(item.unit);
      setCurrentStock(""); // Not editable in edit mode
      setLowStockThreshold(item.lowStockThreshold.toString());
    } else if (open) {
      setName("");
      setUnit("g");
      setCurrentStock("");
      setLowStockThreshold("");
    }
    setError("");
  }, [open, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!item) {
      // Create mode — need currentStock
      const stock = parseFloat(currentStock);
      const threshold = parseFloat(lowStockThreshold);
      if (isNaN(stock) || stock < 0) {
        setError("Current stock must be a non-negative number");
        return;
      }
      if (isNaN(threshold) || threshold < 0) {
        setError("Low stock threshold must be a non-negative number");
        return;
      }
    } else {
      // Edit mode
      const threshold = parseFloat(lowStockThreshold);
      if (isNaN(threshold) || threshold < 0) {
        setError("Low stock threshold must be a non-negative number");
        return;
      }
    }

    setSaving(true);
    try {
      if (item) {
        // Update
        const res = await fetch(`/api/admin/inventory/${item.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            unit,
            lowStockThreshold: parseFloat(lowStockThreshold),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to update inventory item");
        }
      } else {
        // Create
        const res = await fetch("/api/admin/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            unit,
            currentStock: parseFloat(currentStock),
            lowStockThreshold: parseFloat(lowStockThreshold),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to create inventory item");
        }
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

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
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {item ? "Edit Inventory Item" : "Add Inventory Item"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Espresso Beans"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Unit *</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Current Stock (only for create) */}
              {!item && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Current Stock *</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>
              )}

              {/* Low Stock Threshold */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Low Stock Threshold *</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="10"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : item ? "Save Changes" : "Create Item"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
