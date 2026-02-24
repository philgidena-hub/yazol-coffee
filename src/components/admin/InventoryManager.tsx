"use client";

import { useState, useEffect, useMemo } from "react";
import type { InventoryItem } from "@/lib/dynamodb";
import { useToast } from "./AdminToast";
import ConfirmModal from "./ConfirmModal";
import InventoryItemForm from "./InventoryItemForm";

type SortField = "name" | "currentStock" | "lowStockThreshold";
type SortDir = "asc" | "desc";

interface InventoryManagerProps {
  refreshKey: number;
  role?: string;
}

export default function InventoryManager({ refreshKey, role }: InventoryManagerProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [restockSlug, setRestockSlug] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState("");
  const [restocking, setRestocking] = useState(false);
  const [setStockSlug, setSetStockSlug] = useState<string | null>(null);
  const [setStockValue, setSetStockValue] = useState("");
  const [settingStock, setSettingStock] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const isAdmin = role === "super_admin" || role === "admin";

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast("Failed to load inventory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSetStock = async (slug: string) => {
    const value = parseFloat(setStockValue);
    if (isNaN(value) || value < 0) {
      toast("Enter a valid non-negative number", "error");
      return;
    }

    setSettingStock(true);
    try {
      const res = await fetch(`/api/admin/inventory/${slug}/set-stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: value }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to set stock");
      }

      setItems((prev) =>
        prev.map((item) =>
          item.slug === slug ? { ...item, currentStock: value } : item
        )
      );
      toast(`Stock set to ${value}`, "success");
      setSetStockSlug(null);
      setSetStockValue("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Set stock failed", "error");
    } finally {
      setSettingStock(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/inventory/${deleteTarget.slug}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete");
      }
      setItems((prev) => prev.filter((i) => i.slug !== deleteTarget.slug));
      toast(`Deleted "${deleteTarget.name}"`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSaved = () => {
    fetchInventory();
    toast(editingItem ? "Inventory item updated" : "Inventory item created", "success");
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
        <div className="flex-1" />
        <button
          onClick={openCreate}
          className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
        >
          + Add Item
        </button>
      </div>

      {loading ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse h-48" />
      ) : items.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <p className="text-slate-500 text-sm">No inventory items yet</p>
          <button
            onClick={openCreate}
            className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
          >
            Add your first inventory item
          </button>
        </div>
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
                  <th className="text-center text-slate-500 text-[11px] font-body font-medium uppercase tracking-wider px-4 py-2.5 w-36">
                    Actions
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
                      className={`group ${
                        isLow
                          ? "bg-red-950/30 border-l-[3px] border-l-red-500"
                          : "border-l-[3px] border-l-transparent hover:bg-slate-800/30"
                      }`}
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
                        ) : setStockSlug === item.slug ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={setStockValue}
                              onChange={(e) => setSetStockValue(e.target.value)}
                              placeholder="Value"
                              className="w-16 px-2 py-1 text-xs bg-slate-800 border border-amber-700 rounded text-white text-right focus:outline-none focus:border-amber-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSetStock(item.slug);
                                if (e.key === "Escape") {
                                  setSetStockSlug(null);
                                  setSetStockValue("");
                                }
                              }}
                            />
                            <button
                              onClick={() => handleSetStock(item.slug)}
                              disabled={settingStock}
                              className="px-2 py-1 text-[10px] font-body font-medium bg-amber-600 text-white rounded hover:bg-amber-500 disabled:opacity-50"
                            >
                              {settingStock ? "..." : "Set"}
                            </button>
                            <button
                              onClick={() => {
                                setSetStockSlug(null);
                                setSetStockValue("");
                              }}
                              className="px-1.5 py-1 text-[10px] font-body text-slate-500 hover:text-slate-300"
                            >
                              x
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1.5 text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
                              title="Edit"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                              title="Delete"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setRestockSlug(item.slug)}
                              className="px-2.5 py-1 text-[10px] font-body font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded transition-colors"
                            >
                              Restock
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setSetStockSlug(item.slug);
                                  setSetStockValue(String(item.currentStock));
                                }}
                                className="px-2.5 py-1 text-[10px] font-body font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded transition-colors"
                              >
                                Set
                              </button>
                            )}
                          </div>
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

      {/* Create/Edit Form Modal */}
      <InventoryItemForm
        open={formOpen}
        item={editingItem}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
