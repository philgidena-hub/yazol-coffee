"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { InventoryItem } from "@/lib/dynamodb";
import { useToast } from "./AdminToast";
import ConfirmModal from "./ConfirmModal";
import InventoryItemForm from "./InventoryItemForm";

type SortField = "name" | "currentStock" | "lowStockThreshold";
type SortDir = "asc" | "desc";
type FilterCategory = "" | string;

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
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("");
  const [wasteItem, setWasteItem] = useState<InventoryItem | null>(null);
  const [wasteAmount, setWasteAmount] = useState("");
  const [wasteReason, setWasteReason] = useState("");
  const [recordingWaste, setRecordingWaste] = useState(false);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [historyData, setHistoryData] = useState<Array<{ type: string; quantity: number; previousStock: number; newStock: number; reason?: string; performedBy: string; createdAt: string }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
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

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category || "other"));
    return Array.from(cats).sort();
  }, [items]);

  const sortedItems = useMemo(() => {
    let filtered = items;
    if (filterCategory) {
      filtered = items.filter((i) => (i.category || "other") === filterCategory);
    }
    return [...filtered].sort((a, b) => {
      let cmp: number;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = a[sortField] - b[sortField];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, sortField, sortDir, filterCategory]);

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

  const handleRecordWaste = async () => {
    if (!wasteItem) return;
    const amount = parseFloat(wasteAmount);
    if (!amount || amount <= 0) { toast("Enter a valid amount", "error"); return; }
    if (!wasteReason.trim()) { toast("Reason is required", "error"); return; }

    setRecordingWaste(true);
    try {
      const res = await fetch(`/api/admin/inventory/${wasteItem.slug}/waste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason: wasteReason.trim() }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      setItems((prev) => prev.map((i) =>
        i.slug === wasteItem.slug ? { ...i, currentStock: Math.max(0, i.currentStock - amount) } : i
      ));
      toast(`Recorded waste: ${amount} ${wasteItem.unit}`, "success");
      setWasteItem(null);
      setWasteAmount("");
      setWasteReason("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setRecordingWaste(false);
    }
  };

  const openHistory = async (item: InventoryItem) => {
    setHistoryItem(item);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/admin/inventory/${item.slug}/history`);
      const data = await res.json();
      setHistoryData(data.history || []);
    } catch { setHistoryData([]); }
    finally { setHistoryLoading(false); }
  };

  const expiringItems = items.filter((i) => {
    if (!i.expiryDate) return false;
    const days = (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days <= 7 && days > 0;
  });

  const expiredItems = items.filter((i) => {
    if (!i.expiryDate) return false;
    return new Date(i.expiryDate).getTime() < Date.now();
  });

  const lowCount = items.filter((i) => i.currentStock < i.lowStockThreshold).length;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-slate-700 ml-1">&uarr;&darr;</span>;
    return <span className="text-indigo-400 ml-1">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h2 className="font-body font-semibold text-lg text-white">Inventory</h2>
        {lowCount > 0 && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-red-400 text-xs font-body font-medium">{lowCount} low</span>
          </span>
        )}
        {expiredItems.length > 0 && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
            <span className="text-red-400 text-xs font-body font-medium">{expiredItems.length} expired</span>
          </span>
        )}
        {expiringItems.length > 0 && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400 text-xs font-body font-medium">{expiringItems.length} expiring soon</span>
          </span>
        )}
        <div className="flex-1" />
        {categories.length > 1 && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        )}
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
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-body text-slate-200">{item.name}</span>
                          <span className="text-slate-600 text-xs">{item.unit}</span>
                          {item.category && (
                            <span className="text-[9px] font-medium text-slate-500 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5">{item.category}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {item.costPrice !== undefined && item.costPrice > 0 && (
                            <span className="text-[10px] text-slate-600">${item.costPrice.toFixed(2)}/{item.unit}</span>
                          )}
                          {item.supplier && (
                            <span className="text-[10px] text-slate-600">{item.supplier}</span>
                          )}
                          {item.expiryDate && (() => {
                            const days = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / (1000*60*60*24));
                            const expired = days < 0;
                            const soon = days >= 0 && days <= 7;
                            return (
                              <span className={`text-[10px] font-medium ${expired ? "text-red-400" : soon ? "text-amber-400" : "text-slate-600"}`}>
                                {expired ? `Expired ${Math.abs(days)}d ago` : days === 0 ? "Expires today" : `Exp in ${days}d`}
                              </span>
                            );
                          })()}
                        </div>
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
                            <button
                              onClick={() => setWasteItem(item)}
                              className="px-2.5 py-1 text-[10px] font-body font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Record Waste"
                            >
                              Waste
                            </button>
                            <button
                              onClick={() => openHistory(item)}
                              className="p-1.5 text-slate-600 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all"
                              title="Stock History"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
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

      {/* Waste Recording Modal */}
      <AnimatePresence>
        {wasteItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setWasteItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-1">Record Waste</h3>
              <p className="text-sm text-slate-400 mb-4">{wasteItem.name} — {wasteItem.currentStock} {wasteItem.unit} in stock</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Amount ({wasteItem.unit}) *</label>
                  <input
                    type="number" step="any" min="0" value={wasteAmount}
                    onChange={(e) => setWasteAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="0" autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Reason *</label>
                  <select
                    value={wasteReason} onChange={(e) => setWasteReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Select reason...</option>
                    <option value="Expired">Expired</option>
                    <option value="Spoiled">Spoiled</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Spilled">Spilled</option>
                    <option value="Quality issue">Quality issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setWasteItem(null)} className="px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg">Cancel</button>
                  <button onClick={handleRecordWaste} disabled={recordingWaste} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg disabled:opacity-50">
                    {recordingWaste ? "Recording..." : "Record Waste"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock History Modal */}
      <AnimatePresence>
        {historyItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setHistoryItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <h3 className="text-lg font-semibold text-white mb-1">Stock History</h3>
              <p className="text-sm text-slate-400 mb-4">{historyItem.name}</p>
              <div className="flex-1 overflow-y-auto min-h-0">
                {historyLoading ? (
                  <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
                ) : historyData.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">No stock movements recorded yet</div>
                ) : (
                  <div className="space-y-2">
                    {historyData.map((entry, i) => {
                      const isPositive = entry.quantity > 0;
                      const typeColors: Record<string, string> = {
                        restock: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                        deduction: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                        adjustment: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                        waste: "text-red-400 bg-red-500/10 border-red-500/20",
                      };
                      return (
                        <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-800/50 last:border-0">
                          <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${typeColors[entry.type] || "text-slate-400 bg-slate-800 border-slate-700"}`}>
                            {entry.type}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-mono font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                                {isPositive ? "+" : ""}{entry.quantity}
                              </span>
                              <span className="text-[10px] text-slate-600">{entry.previousStock} → {entry.newStock}</span>
                            </div>
                            {entry.reason && <p className="text-[11px] text-slate-500 mt-0.5">{entry.reason}</p>}
                            <p className="text-[10px] text-slate-600 mt-0.5">by {entry.performedBy} · {new Date(entry.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="pt-3 mt-3 border-t border-slate-800">
                <button onClick={() => setHistoryItem(null)} className="w-full px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
