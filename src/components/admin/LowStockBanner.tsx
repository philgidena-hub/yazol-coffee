"use client";

import { useState, useEffect, useCallback } from "react";

interface LowStockItem {
  name: string;
  slug: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
}

export default function LowStockBanner() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const fetchLowStock = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inventory/low-stock");
      if (!res.ok) return;
      const data = await res.json();
      if (data.items) setItems(data.items);
    } catch {
      // Silently ignore — banner is non-critical
    }
  }, []);

  useEffect(() => {
    fetchLowStock();
    const interval = setInterval(fetchLowStock, 30_000);
    return () => clearInterval(interval);
  }, [fetchLowStock]);

  if (items.length === 0) return null;

  const outOfStock = items.filter((i) => i.currentStock <= 0);
  const lowStock = items.filter((i) => i.currentStock > 0);

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-colors ${
          outOfStock.length > 0
            ? "bg-red-950/40 border-red-500/20 hover:border-red-500/40"
            : "bg-amber-950/30 border-amber-500/20 hover:border-amber-500/40"
        }`}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 ${outOfStock.length > 0 ? "text-red-400" : "text-amber-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <span
            className={`text-xs font-body font-medium ${
              outOfStock.length > 0 ? "text-red-400" : "text-amber-400"
            }`}
          >
            {outOfStock.length > 0
              ? `${outOfStock.length} out of stock`
              : `${lowStock.length} low stock`}
            {outOfStock.length > 0 && lowStock.length > 0 && `, ${lowStock.length} low`}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform ${collapsed ? "" : "rotate-180"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="mt-1 px-4 py-2 space-y-1">
          {outOfStock.map((item) => (
            <div key={item.slug} className="flex items-center justify-between text-xs font-body">
              <span className="text-red-400 font-medium">{item.name}</span>
              <span className="text-red-400/70 tabular-nums">
                0 / {item.lowStockThreshold} {item.unit}
              </span>
            </div>
          ))}
          {lowStock.map((item) => (
            <div key={item.slug} className="flex items-center justify-between text-xs font-body">
              <span className="text-amber-400">{item.name}</span>
              <span className="text-amber-400/70 tabular-nums">
                {item.currentStock} / {item.lowStockThreshold} {item.unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
