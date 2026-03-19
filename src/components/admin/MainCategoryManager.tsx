"use client";

import { useState, useEffect } from "react";
import type { MainCategory } from "@/lib/types";
import { useToast } from "./AdminToast";
import ConfirmModal from "./ConfirmModal";

const ICON_OPTIONS = [
  { value: "coffee", label: "Coffee Cup" },
  { value: "ice-cream", label: "Ice Cream" },
];

const COLOR_OPTIONS = [
  { value: "brown", label: "Brown" },
  { value: "teal-600", label: "Teal" },
  { value: "indigo-600", label: "Indigo" },
  { value: "rose-600", label: "Rose" },
  { value: "amber-600", label: "Amber" },
  { value: "emerald-600", label: "Emerald" },
];

export default function MainCategoryManager() {
  const [items, setItems] = useState<MainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MainCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MainCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [iconType, setIconType] = useState<"coffee" | "ice-cream">("coffee");
  const [accentColor, setAccentColor] = useState("brown");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/main-categories");
      const data = await res.json();
      if (data.mainCategories) setItems(data.mainCategories);
    } catch {
      toast("Failed to load main categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSubtitle("");
    setSortOrder(items.length + 1);
    setIconType("coffee");
    setAccentColor("brown");
    setFormOpen(true);
  };

  const openEdit = (mc: MainCategory) => {
    setEditing(mc);
    setName(mc.name);
    setSubtitle(mc.subtitle);
    setSortOrder(mc.sortOrder);
    setIconType(mc.iconType);
    setAccentColor(mc.accentColor);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    try {
      const url = editing
        ? `/api/admin/main-categories/${editing.slug}`
        : "/api/admin/main-categories";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), subtitle: subtitle.trim(), sortOrder, iconType, accentColor }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      toast(editing ? "Main category updated" : "Main category created", "success");
      setFormOpen(false);
      fetchItems();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/main-categories/${deleteTarget.slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setItems((prev) => prev.filter((i) => i.slug !== deleteTarget.slug));
      toast(`Deleted "${deleteTarget.name}"`, "success");
    } catch {
      toast("Delete failed", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-body font-semibold text-sm text-slate-400">Main Categories</h2>
        <button
          onClick={openCreate}
          className="px-3 py-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          + Add Main Category
        </button>
      </div>

      {loading ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse h-20" />
      ) : items.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 text-center">
          <p className="text-slate-500 text-sm">No main categories yet</p>
          <button onClick={openCreate} className="mt-2 text-sm text-indigo-400 hover:text-indigo-300">
            Create your first main category
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-800/50">
          {items.map((mc) => (
            <div
              key={mc.slug}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/20 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-600 text-xs font-mono w-6 text-center">{mc.sortOrder}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: mc.accentColor === "brown" ? "#92400e" : mc.accentColor === "teal-600" ? "#0d9488" : mc.accentColor === "indigo-600" ? "#4f46e5" : mc.accentColor === "rose-600" ? "#e11d48" : mc.accentColor === "amber-600" ? "#d97706" : mc.accentColor === "emerald-600" ? "#059669" : "#64748b" }}
                />
                <span className="text-sm text-slate-200 font-body font-medium">{mc.name}</span>
                <span className="text-[10px] text-slate-600 font-body">{mc.subtitle}</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(mc)}
                  className="p-1.5 text-slate-600 hover:text-indigo-400 transition-colors"
                  title="Edit"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteTarget(mc)}
                  className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {editing ? "Edit Main Category" : "Add Main Category"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Coffee"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Ethiopian coffee tradition meets modern craft"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Icon</label>
                  <select
                    value={iconType}
                    onChange={(e) => setIconType(e.target.value as "coffee" | "ice-cream")}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    {ICON_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Color</label>
                  <select
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    {COLOR_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Order</label>
                  <input
                    type="number"
                    min="0"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editing ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Main Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Subcategories under it will become unlinked.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
