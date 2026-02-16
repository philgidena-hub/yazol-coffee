"use client";

import { useState, useEffect } from "react";

interface Stats {
  orderCount: number;
  revenue: number;
  avgOrderValue: number;
  topItems: { name: string; count: number }[];
}

interface DashboardStatsProps {
  refreshKey: number;
}

export default function DashboardStats({ refreshKey }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse h-20"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Today's Orders",
      value: stats?.orderCount ?? 0,
      format: (v: number) => v.toString(),
      accent: "text-indigo-400",
      bg: "bg-indigo-500/5 border-indigo-500/10",
    },
    {
      label: "Revenue",
      value: stats?.revenue ?? 0,
      format: (v: number) => `$${v.toFixed(2)}`,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/5 border-emerald-500/10",
    },
    {
      label: "Avg Order",
      value: stats?.avgOrderValue ?? 0,
      format: (v: number) => `$${v.toFixed(2)}`,
      accent: "text-amber-400",
      bg: "bg-amber-500/5 border-amber-500/10",
    },
    {
      label: "Top Item",
      value: stats?.topItems?.[0]?.name ?? "—",
      format: (v: string) => v,
      accent: "text-sky-400",
      bg: "bg-sky-500/5 border-sky-500/10",
      subtitle: stats?.topItems?.[0]
        ? `${stats.topItems[0].count} sold`
        : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border px-4 py-3 ${card.bg}`}
        >
          <p className="text-[11px] font-body font-medium text-slate-500 uppercase tracking-wider mb-1">
            {card.label}
          </p>
          <p className={`text-lg font-body font-semibold ${card.accent} tabular-nums truncate`}>
            {typeof card.value === "number"
              ? (card.format as (v: number) => string)(card.value)
              : (card.format as (v: string) => string)(card.value)}
          </p>
          {"subtitle" in card && card.subtitle && (
            <p className="text-[10px] font-body text-slate-600 mt-0.5">
              {card.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
