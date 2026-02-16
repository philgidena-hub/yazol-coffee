"use client";

import { useState, useEffect } from "react";
import type { MenuItem } from "@/lib/dynamodb";

export default function MenuToggle() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
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
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
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
      }
    } catch {
      // Revert on failure
      setItems((prev) =>
        prev.map((item) =>
          item.slug === slug ? { ...item, isAvailable: currentAvailability } : item
        )
      );
    } finally {
      setTogglingSlug(null);
    }
  };

  // Group items by category
  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="font-body font-semibold text-lg text-white mb-4">Menu Availability</h2>

      {loading ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse h-48" />
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
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-body truncate ${item.isAvailable ? "text-slate-200" : "text-slate-500 line-through"}`}>
                          {item.name}
                        </p>
                      </div>
                      <p className="text-xs font-body text-slate-600 tabular-nums">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
