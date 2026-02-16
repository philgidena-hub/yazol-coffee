"use client";

import type { Order } from "@/lib/types";

const STATUS_OPTIONS: { value: "all" | Order["status"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
];

interface OrderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | Order["status"];
  onStatusFilterChange: (value: "all" | Order["status"]) => void;
  statusCounts: Record<string, number>;
}

export default function OrderFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  statusCounts,
}: OrderFiltersProps) {
  return (
    <div className="space-y-3 mb-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by name or order ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-body text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
        />
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_OPTIONS.map((opt) => {
          const count = opt.value === "all"
            ? Object.values(statusCounts).reduce((s, c) => s + c, 0)
            : statusCounts[opt.value] || 0;
          const isActive = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onStatusFilterChange(opt.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-body font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:text-slate-300 hover:bg-slate-800"
              }`}
            >
              {opt.label}
              <span
                className={`tabular-nums ${
                  isActive ? "text-indigo-200" : "text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
