"use client";

import { useState, useEffect } from "react";
import type { Category, MainCategory } from "@/lib/types";
import { useToast } from "./AdminToast";
import ConfirmModal from "./ConfirmModal";

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [section, setSection] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [catRes, mcRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/main-categories"),
      ]);
      const catData = await catRes.json();
      const mcData = await mcRes.json();
      if (catData.categories) setCategories(catData.categories);
      if (mcData.mainCategories) setMainCategories(mcData.mainCategories);
    } catch {
      toast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSortOrder(categories.length + 1);
    setSection(mainCategories[0]?.slug || "");
    setFormOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setSortOrder(cat.sortOrder);
    setSection(cat.section || "");
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !section) return;
    setSaving(true);

    try {
      const url = editing
        ? `/api/admin/categories/${editing.slug}`
        : "/api/admin/categories";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), sortOrder, section }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      toast(editing ? "Subcategory updated" : "Subcategory created", "success");
      setFormOpen(false);
      fetchData();
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
      const res = await fetch(`/api/admin/categories/${deleteTarget.slug}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setCategories((prev) => prev.filter((c) => c.slug !== deleteTarget.slug));
      toast(`Deleted "${deleteTarget.name}"`, "success");
    } catch {
      toast("Delete failed", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Group by parent main category
  const grouped = mainCategories.map((mc) => ({
    mainCategory: mc,
    subcategories: categories.filter((c) => c.section === mc.slug),
  }));
  const uncategorized = categories.filter(
    (c) => !c.section || !mainCategories.some((mc) => mc.slug === c.section)
  );

  const renderGroup = (label: string, items: Category[], color: string) => {
    if (items.length === 0) return null;
    return (
      <div key={label}>
        <div className="px-4 py-1.5 bg-slate-800/40">
          <span className={`text-[11px] font-body font-medium uppercase tracking-wider ${color}`}>
            {label}
          </span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {items.map((cat) => (
            <div
              key={cat.slug}
              className="flex items-center justify-between px-4 py-2 hover:bg-slate-800/20 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-600 text-xs font-mono w-6 text-center">
                  {cat.sortOrder}
                </span>
                <span className="text-sm text-slate-200 font-body">{cat.name}</span>
                <span className="text-[10px] text-slate-600 font-body">{cat.slug}</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 text-slate-600 hover:text-indigo-400 transition-colors"
                  title="Edit"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
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
      </div>
    );
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-body font-semibold text-sm text-slate-400">Subcategories</h2>
        <button
          onClick={openCreate}
          className="px-3 py-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          + Add Subcategory
        </button>
      </div>

      {loading ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse h-24" />
      ) : categories.length === 0 ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 text-center">
          <p className="text-slate-500 text-sm">No subcategories yet</p>
          <button onClick={openCreate} className="mt-2 text-sm text-indigo-400 hover:text-indigo-300">
            Create your first subcategory
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          {grouped.map(({ mainCategory, subcategories }) =>
            renderGroup(mainCategory.name, subcategories, "text-slate-400")
          )}
          {renderGroup("Unlinked", uncategorized, "text-slate-600")}
        </div>
      )}

      {/* Create/Edit Form */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {editing ? "Edit Subcategory" : "Add Subcategory"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Espresso"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Parent *</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select...</option>
                    {mainCategories.map((mc) => (
                      <option key={mc.slug} value={mc.slug}>{mc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Sort Order</label>
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
        title="Delete Subcategory"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Menu items in this subcategory will not be deleted but may become uncategorized.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
