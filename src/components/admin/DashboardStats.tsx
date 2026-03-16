"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-sm animate-pulse h-28"
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
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      gradient: "from-indigo-500 to-blue-600",
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-400",
      accentColor: "text-indigo-300",
    },
    {
      label: "Revenue",
      value: stats?.revenue ?? 0,
      format: (v: number) => `$${v.toFixed(2)}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      accentColor: "text-emerald-300",
    },
    {
      label: "Avg Order",
      value: stats?.avgOrderValue ?? 0,
      format: (v: number) => `$${v.toFixed(2)}`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      accentColor: "text-amber-300",
    },
    {
      label: "Top Item",
      value: stats?.topItems?.[0]?.name ?? "--",
      format: (v: string) => v,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      gradient: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-400",
      accentColor: "text-violet-300",
      subtitle: stats?.topItems?.[0]
        ? `${stats.topItems[0].count} sold`
        : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="relative group rounded-2xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-sm p-4 overflow-hidden hover:border-white/[0.12] transition-colors"
        >
          {/* Subtle gradient glow on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />

          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-body font-medium text-slate-500 uppercase tracking-wider">
                {card.label}
              </p>
              <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>
            <p className={`text-2xl font-body font-bold ${card.accentColor} tabular-nums truncate`}>
              {typeof card.value === "number"
                ? (card.format as (v: number) => string)(card.value)
                : (card.format as (v: string) => string)(card.value)}
            </p>
            {"subtitle" in card && card.subtitle && (
              <p className="text-[10px] font-body text-slate-600 mt-1">
                {card.subtitle}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
