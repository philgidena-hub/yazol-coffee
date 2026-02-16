"use client";

import { useState, useEffect } from "react";
import type { MenuItem } from "@/lib/dynamodb";
import { useToast } from "./AdminToast";
import ConfirmModal from "./ConfirmModal";
import MenuItemForm from "./MenuItemForm";

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/admin/menu");
      const data = await res.json();
      if (data.items) {
        setItems(
          data.items.sort((a: MenuItem, b: MenuItem) =>
            a.category === b.category
              ? a.name.localeCompare(b.name)
              : a.category.localeCompare(b.category)
          )
        );
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      toast("Failed to load menu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = async (slug: string, currentAvailability: boolean) => {
    setTogglingSlug(slug);
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.slug === slug ? { ...item, isAvailable: !currentAvailability } : item
      )
    );

    try {
      const res = await fetch(`/api/admin/menu/${slug}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !currentAvailability }),
      });

      if (!res.ok) {
        // Revert on failure
        setItems((prev) =>
          prev.map((item) =>
            item.slug === slug ? { ...item, isAvailable: currentAvailability } : item
          )
        );
        toast("Failed to toggle availability", "error");
      }
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item.slug === slug ? { ...item, isAvailable: currentAvailability } : item
        )
      );
      toast("Failed to toggle availability", "error");
    } finally {
      setTogglingSlug(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/menu/${deleteTarget.slug}`, {
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

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSaved = () => {
    fetchMenu();
    toast(editingItem ? "Menu item updated" : "Menu item created", "success");
  };

  // Group items by category
  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-body font-semibold text-lg text-white">Menu</h2>
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
          <p className="text-slate-500 text-sm">No menu items yet</p>
          <button
            onClick={openCreate}
            className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
          >
            Create your first menu item
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          {Object.entries(grouped).map(([category, categoryItems], groupIdx) => (
            <div key={category}>
              {groupIdx > 0 && <div className="border-t border-slate-800" />}
              <div className="px-4 py-2 bg-slate-800/40">
                <span className="text-slate-500 text-[11px] font-body font-medium uppercase tracking-wider">
                  {category}
                </span>
              </div>
              <div className="divide-y divide-slate-800/50">
                {categoryItems.map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/20 transition-colors group"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-body truncate ${
                            item.isAvailable ? "text-slate-200" : "text-slate-500 line-through"
                          }`}
                        >
                          {item.name}
                        </p>
                      </div>
                      <p className="text-xs font-body text-slate-600 tabular-nums">
                        ${item.price.toFixed(2)}
                        {item.ingredients.length > 0 && (
                          <span className="ml-2 text-slate-700">
                            {item.ingredients.length} ingredient{item.ingredients.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Edit"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(item.slug, item.isAvailable)}
                        disabled={togglingSlug === item.slug}
                        className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-900 ${
                          item.isAvailable
                            ? "bg-emerald-500 focus:ring-emerald-500/40"
                            : "bg-slate-700 focus:ring-slate-500/40"
                        } ${togglingSlug === item.slug ? "opacity-50" : ""}`}
                        aria-label={`Toggle ${item.name} availability`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            item.isAvailable ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <MenuItemForm
        open={formOpen}
        item={editingItem}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
