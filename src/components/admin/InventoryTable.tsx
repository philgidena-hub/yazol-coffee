"use client";

import { useState, useEffect, useMemo } from "react";
import type { InventoryItem } from "@/lib/dynamodb";
import { useToast } from "./AdminToast";

type SortField = "name" | "currentStock" | "lowStockThreshold";
type SortDir = "asc" | "desc";

interface InventoryTableProps {
  refreshKey: number;
}

export default function InventoryTable({ refreshKey }: InventoryTableProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [restockSlug, setRestockSlug] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [restocking, setRestocking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch("/api/admin/inventory");
        const data = await res.json();
        if (data.items) {
          setItems(data.items);
        }
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, [refreshKey]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let cmp: number;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = a[sortField] - b[sortField];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortField, sortDir]);

  const handleRestock = async (slug: string) => {
    const amount = parseFloat(restockAmount);
    if (!amount || amount <= 0) {
      toast("Enter a valid amount", "error");
      return;
    }

    setRestocking(true);
    try {
      const res = await fetch(`/api/admin/inventory/${slug}/restock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to restock");
      }

      // Update local state immediately
      setItems((prev) =>
        prev.map((item) =>
          item.slug === slug
            ? { ...item, currentStock: item.currentStock + amount }
            : item
        )
      );
      toast(`Restocked +${amount}`, "success");
      setRestockSlug(null);
      setRestockAmount("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Restock failed", "error");
    } finally {
      setRestocking(false);
    }
  };

  const lowCount = items.filter((i) => i.currentStock < i.lowStockThreshold).length;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-slate-700 ml-1">&uarr;&darr;</span>;
    return <span className="text-indigo-400 ml-1">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-body font-semibold text-lg text-white">Inventory</h2>
        {lowCount > 0 && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-red-400 text-xs font-body font-medium">
              {lowCount} low
            </span>
          </span>
        )}
      </div>

      {loading ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse h-48" />
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th
                    onClick={() => handleSort("name")}
                    className="text-left text-slate-500 text-[11px] font-body font-medium uppercase tracking-wider px-4 py-2.5 cursor-pointer hover:text-slate-300 select-none"
                  >
                    Item <SortIcon field="name" />
                  </th>
                  <th
                    onClick={() => handleSort("currentStock")}
                    className="text-right text-slate-500 text-[11px] font-body font-medium uppercase tracking-wider px-4 py-2.5 cursor-pointer hover:text-slate-300 select-none"
                  >
                    Stock <SortIcon field="currentStock" />
                  </th>
                  <th
                    onClick={() => handleSort("lowStockThreshold")}
                    className="text-right text-slate-500 text-[11px] font-body font-medium uppercase tracking-wider px-4 py-2.5 cursor-pointer hover:text-slate-300 select-none"
                  >
                    Min <SortIcon field="lowStockThreshold" />
                  </th>
                  <th className="text-center text-slate-500 text-[11px] font-body font-medium uppercase tracking-wider px-4 py-2.5 w-28">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sortedItems.map((item) => {
                  const isLow = item.currentStock < item.lowStockThreshold;
                  const isRestocking = restockSlug === item.slug;
                  return (
                    <tr
                      key={item.slug}
                      className={
                        isLow
                          ? "bg-red-950/30 border-l-[3px] border-l-red-500"
                          : "border-l-[3px] border-l-transparent hover:bg-slate-800/30"
                      }
                    >
                      <td className="px-4 py-2.5">
                        <span className="text-sm font-body text-slate-200">{item.name}</span>
                        <span className="text-slate-600 text-xs ml-1.5">{item.unit}</span>
                      </td>
                      <td
                        className={`px-4 py-2.5 text-sm font-body font-medium text-right tabular-nums ${
                          isLow ? "text-red-400" : "text-slate-300"
                        }`}
                      >
                        {item.currentStock.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-body text-right text-slate-600 tabular-nums">
                        {item.lowStockThreshold.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {isRestocking ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={restockAmount}
                              onChange={(e) => setRestockAmount(e.target.value)}
                              placeholder="Qty"
                              className="w-16 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white text-right focus:outline-none focus:border-indigo-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRestock(item.slug);
                                if (e.key === "Escape") {
                                  setRestockSlug(null);
                                  setRestockAmount("");
                                }
                              }}
                            />
                            <button
                              onClick={() => handleRestock(item.slug)}
                              disabled={restocking}
                              className="px-2 py-1 text-[10px] font-body font-medium bg-emerald-600 text-white rounded hover:bg-emerald-500 disabled:opacity-50"
                            >
                              {restocking ? "..." : "+"}
                            </button>
                            <button
                              onClick={() => {
                                setRestockSlug(null);
                                setRestockAmount("");
                              }}
                              className="px-1.5 py-1 text-[10px] font-body text-slate-500 hover:text-slate-300"
                            >
                              x
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRestockSlug(item.slug)}
                            className="px-2.5 py-1 text-[10px] font-body font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded transition-colors"
                          >
                            Restock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
