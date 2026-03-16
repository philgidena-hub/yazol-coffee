"use client";

import type { Order } from "@/lib/types";

const STATUS_OPTIONS: { value: "all" | Order["status"]; label: string; dot?: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending", dot: "bg-amber-400" },
  { value: "approved", label: "Approved", dot: "bg-sky-400" },
  { value: "preparing", label: "Preparing", dot: "bg-orange-400" },
  { value: "prepared", label: "Prepared", dot: "bg-emerald-400" },
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
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
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
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 backdrop-blur-sm border border-white/[0.06] rounded-xl text-sm font-body text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-slate-800/40 text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-white/[0.04]"
              }`}
            >
              {opt.dot && !isActive && (
                <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
              )}
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
