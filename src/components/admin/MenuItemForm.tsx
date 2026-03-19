"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem, Category } from "@/lib/dynamodb";
import type { MenuItemSize, MenuItemOptionGroup, MenuItemOption } from "@/lib/types";
import { getProductImage } from "@/lib/image-map";
import ImageUpload from "./ImageUpload";

interface MenuItemFormProps {
  open: boolean;
  item: MenuItem | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

interface IngredientRow {
  name: string;
  quantity: string;
  unit: string;
}

const UNITS = ["g", "ml", "pc", "pods", "sticks", "oz", "cups"];

export default function MenuItemForm({ open, item, onClose, onSaved }: MenuItemFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [sizes, setSizes] = useState<MenuItemSize[]>([]);
  const [optionGroups, setOptionGroups] = useState<MenuItemOptionGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories
  useEffect(() => {
    if (open) {
      fetch("/api/categories")
        .then((r) => r.json())
        .then((data) => {
          if (data.categories) setCategories(data.categories);
        })
        .catch(() => {});
    }
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (open && item) {
      setName(item.name);
      setDescription(item.description);
      setCategory(item.category);
      // Derive categorySlug from existing GSI1PK or from category name
      const raw = item as unknown as Record<string, unknown>;
      const slug = raw.GSI1PK
        ? String(raw.GSI1PK).replace("CATEGORY#", "")
        : item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setCategorySlug(slug);
      setPrice(item.price.toString());
      setIsAvailable(item.isAvailable);
      setImageUrl(item.imageKey || "");
      setIngredients(item.ingredients.map((ing) => ({ ...ing })));
      setSizes(item.sizes ? item.sizes.map((s) => ({ ...s })) : []);
      setOptionGroups(item.optionGroups ? item.optionGroups.map((g) => ({
        ...g,
        options: g.options.map((o) => ({ ...o })),
      })) : []);
    } else if (open) {
      setName("");
      setDescription("");
      setCategory("");
      setCategorySlug("");
      setPrice("");
      setIsAvailable(true);
      setImageUrl("");
      setIngredients([]);
      setSizes([]);
      setOptionGroups([]);
    }
    setError("");
  }, [open, item]);

  const handleCategoryChange = (catSlug: string) => {
    const cat = categories.find((c) => c.slug === catSlug);
    if (cat) {
      setCategory(cat.name);
      setCategorySlug(cat.slug);
    }
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: "", quantity: "", unit: "g" }]);
  };

  const updateIngredient = (index: number, field: keyof IngredientRow, value: string) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !description.trim() || !category || !categorySlug || !price) {
      setError("Please fill in all required fields");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a valid non-negative number");
      return;
    }

    // Filter out empty ingredients
    const validIngredients = ingredients.filter((ing) => ing.name.trim() && ing.quantity.trim());

    setSaving(true);
    try {
      const url = item ? `/api/admin/menu/${item.slug}` : "/api/admin/menu";
      const method = item ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          categorySlug,
          price: priceNum,
          isAvailable,
          imageKey: imageUrl || undefined,
          ingredients: validIngredients,
          sizes: sizes.filter((s) => s.name.trim() && s.price >= 0),
          optionGroups: optionGroups
            .filter((g) => g.name.trim() && g.options.length > 0)
            .map((g) => ({
              ...g,
              options: g.options.filter((o) => o.name.trim()),
            })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to ${item ? "update" : "create"} menu item`);
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
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {item ? "Edit Menu Item" : "Add Menu Item"}
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
                  placeholder="e.g. Cappuccino"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="A rich and creamy espresso drink..."
                />
              </div>

              {/* Category + Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category *</label>
                  <select
                    value={categorySlug}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select...</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    placeholder="4.50"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                    isAvailable ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      isAvailable ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm text-slate-300">
                  {isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>

              {/* Item Image */}
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                folder="menu"
                label="Item Image"
                previewUrl={item ? getProductImage(item.slug, imageUrl) : undefined}
              />

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-400">Ingredients</label>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    + Add Ingredient
                  </button>
                </div>
                {ingredients.length === 0 ? (
                  <p className="text-xs text-slate-600">No ingredients added</p>
                ) : (
                  <div className="space-y-2">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => updateIngredient(i, "name", e.target.value)}
                          placeholder="Name"
                          className="flex-1 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          value={ing.quantity}
                          onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
                          placeholder="Qty"
                          className="w-16 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white text-right focus:outline-none focus:border-indigo-500"
                        />
                        <select
                          value={ing.unit}
                          onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                          className="w-20 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-indigo-500"
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeIngredient(i)}
                          className="p-1 text-slate-600 hover:text-red-400"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sizes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-400">Sizes (optional)</label>
                  <button
                    type="button"
                    onClick={() => setSizes((prev) => [...prev, { name: "", price: 0 }])}
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    + Add Size
                  </button>
                </div>
                {sizes.length === 0 ? (
                  <p className="text-xs text-slate-600">No sizes — base price used for all</p>
                ) : (
                  <div className="space-y-2">
                    {sizes.map((size, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={size.name}
                          onChange={(e) => setSizes((prev) => prev.map((s, j) => j === i ? { ...s, name: e.target.value } : s))}
                          placeholder="e.g. Small"
                          className="flex-1 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={size.price || ""}
                          onChange={(e) => setSizes((prev) => prev.map((s, j) => j === i ? { ...s, price: parseFloat(e.target.value) || 0 } : s))}
                          placeholder="Price"
                          className="w-20 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white text-right focus:outline-none focus:border-indigo-500"
                        />
                        <button type="button" onClick={() => setSizes((prev) => prev.filter((_, j) => j !== i))} className="p-1 text-slate-600 hover:text-red-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Option Groups */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-400">Customization Options (optional)</label>
                  <button
                    type="button"
                    onClick={() => setOptionGroups((prev) => [...prev, { name: "", required: false, maxChoices: 1, options: [] }])}
                    className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    + Add Group
                  </button>
                </div>
                {optionGroups.length === 0 ? (
                  <p className="text-xs text-slate-600">No customization options</p>
                ) : (
                  <div className="space-y-4">
                    {optionGroups.map((group, gi) => (
                      <div key={gi} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => setOptionGroups((prev) => prev.map((g, j) => j === gi ? { ...g, name: e.target.value } : g))}
                            placeholder="Group name (e.g. Milk Option)"
                            className="flex-1 px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-indigo-500"
                          />
                          <label className="flex items-center gap-1.5 text-[10px] text-slate-400 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={group.required}
                              onChange={(e) => setOptionGroups((prev) => prev.map((g, j) => j === gi ? { ...g, required: e.target.checked } : g))}
                              className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/20"
                            />
                            Required
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={group.maxChoices}
                            onChange={(e) => setOptionGroups((prev) => prev.map((g, j) => j === gi ? { ...g, maxChoices: parseInt(e.target.value) || 1 } : g))}
                            className="w-12 px-1.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-white text-center focus:outline-none focus:border-indigo-500"
                            title="Max choices"
                          />
                          <button type="button" onClick={() => setOptionGroups((prev) => prev.filter((_, j) => j !== gi))} className="p-1 text-slate-600 hover:text-red-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-2">Max choices: {group.maxChoices} · {group.required ? "Required" : "Optional"}</p>

                        {/* Options in this group */}
                        <div className="space-y-1.5">
                          {group.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={opt.name}
                                onChange={(e) => setOptionGroups((prev) => prev.map((g, j) => j === gi ? {
                                  ...g,
                                  options: g.options.map((o, k) => k === oi ? { ...o, name: e.target.value } : o),
                                } : g))}
                                placeholder="Option name"
                                className="flex-1 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-indigo-500"
                              />
                              <div className="flex items-center gap-0.5">
                                <span className="text-[10px] text-slate-500">+$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={opt.priceAdd || ""}
                                  onChange={(e) => setOptionGroups((prev) => prev.map((g, j) => j === gi ? {
                                    ...g,
                                    options: g.options.map((o, k) => k === oi ? { ...o, priceAdd: parseFloat(e.target.value) || 0 } : o),
                                  } : g))}
                                  placeholder="0.00"
                                  className="w-16 px-1.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white text-right focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <button type="button" onClick={() => setOptionGroups((prev) => prev.map((g, j) => j === gi ? {
                                ...g,
                                options: g.options.filter((_, k) => k !== oi),
                              } : g))} className="p-0.5 text-slate-600 hover:text-red-400">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setOptionGroups((prev) => prev.map((g, j) => j === gi ? {
                            ...g,
                            options: [...g.options, { name: "", priceAdd: 0 }],
                          } : g))}
                          className="mt-2 text-[10px] font-medium text-indigo-400 hover:text-indigo-300"
                        >
                          + Add Option
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
