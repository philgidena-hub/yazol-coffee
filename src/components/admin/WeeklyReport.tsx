"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface WeeklyStats {
  period: { start: string; end: string };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    completedOrders: number;
    cancelledOrders: number;
  };
  dailyBreakdown: Array<{
    date: string;
    dayLabel: string;
    orders: number;
    revenue: number;
  }>;
  topItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  salesByStaff: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
}

interface WeeklyReportProps {
  refreshKey?: number;
}

export default function WeeklyReport({ refreshKey = 0 }: WeeklyReportProps) {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeeklyStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/stats/weekly");
        if (!res.ok) {
          throw new Error("Failed to fetch weekly stats");
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch weekly stats:", err);
        setError("Unable to load weekly report. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchWeeklyStats();
  }, [refreshKey]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-8 text-center">
        <p className="text-slate-400 font-body text-sm">
          {error || "No data available."}
        </p>
      </div>
    );
  }

  const maxRevenue = Math.max(...stats.dailyBreakdown.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Period Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-body text-slate-500 uppercase tracking-wider">
          Weekly Report: {stats.period.start} to {stats.period.end}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Orders",
            value: stats.summary.totalOrders.toString(),
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
            label: "Total Revenue",
            value: `$${stats.summary.totalRevenue.toFixed(2)}`,
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
            label: "Avg Order Value",
            value: `$${stats.summary.avgOrderValue.toFixed(2)}`,
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
            label: "Completed",
            value: stats.summary.completedOrders.toString(),
            subtitle: stats.summary.cancelledOrders > 0
              ? `${stats.summary.cancelledOrders} cancelled`
              : undefined,
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            gradient: "from-violet-500 to-purple-600",
            iconBg: "bg-violet-500/15",
            iconColor: "text-violet-400",
            accentColor: "text-violet-300",
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="relative group rounded-2xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-sm p-4 overflow-hidden hover:border-white/[0.12] transition-colors"
          >
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
                {card.value}
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

      {/* Daily Sales Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5"
      >
        <h3 className="text-white font-body font-semibold text-base mb-4">
          Daily Sales
        </h3>
        <div className="flex items-end gap-3 h-48">
          {stats.dailyBreakdown.map((day, i) => {
            const barHeight =
              maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
                style={{ originY: 1 }}
                className="flex-1 flex flex-col items-center justify-end h-full"
              >
                <div className="w-full flex flex-col items-center justify-end flex-1">
                  {day.revenue > 0 && (
                    <p className="text-[10px] font-body text-slate-400 mb-1 tabular-nums">
                      ${day.revenue.toFixed(0)}
                    </p>
                  )}
                  <div
                    className="w-full max-w-[48px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-300"
                    style={{
                      height: `${Math.max(barHeight, day.revenue > 0 ? 4 : 0)}%`,
                      minHeight: day.revenue > 0 ? "4px" : "0px",
                    }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-body text-slate-400">
                    {day.dayLabel}
                  </p>
                  <p className="text-[10px] font-body text-slate-600">
                    {day.orders} {day.orders === 1 ? "order" : "orders"}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Items */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5"
        >
          <h3 className="text-white font-body font-semibold text-base mb-4">
            Top Items
          </h3>
          {stats.topItems.length === 0 ? (
            <p className="text-sm font-body text-slate-500">
              No items sold this week.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr>
                    <th className="text-left text-slate-500 text-xs uppercase tracking-wider pb-3 pr-3">
                      #
                    </th>
                    <th className="text-left text-slate-500 text-xs uppercase tracking-wider pb-3 pr-3">
                      Item
                    </th>
                    <th className="text-right text-slate-500 text-xs uppercase tracking-wider pb-3 pr-3">
                      Qty
                    </th>
                    <th className="text-right text-slate-500 text-xs uppercase tracking-wider pb-3">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topItems.map((item, i) => (
                    <tr
                      key={item.name}
                      className="border-b border-white/[0.04]"
                    >
                      <td className="py-2.5 pr-3 text-slate-600 tabular-nums">
                        {i + 1}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-300 truncate max-w-[180px]">
                        {item.name}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-slate-400 tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right text-emerald-400 tabular-nums">
                        ${item.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Sales by Staff */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5"
        >
          <h3 className="text-white font-body font-semibold text-base mb-4">
            Sales by Staff
          </h3>
          {stats.salesByStaff.length === 0 ? (
            <p className="text-sm font-body text-slate-500">
              No sales this week.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr>
                    <th className="text-left text-slate-500 text-xs uppercase tracking-wider pb-3 pr-3">
                      Staff / Source
                    </th>
                    <th className="text-right text-slate-500 text-xs uppercase tracking-wider pb-3 pr-3">
                      Orders
                    </th>
                    <th className="text-right text-slate-500 text-xs uppercase tracking-wider pb-3">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.salesByStaff.map((staff) => (
                    <tr
                      key={staff.name}
                      className="border-b border-white/[0.04]"
                    >
                      <td className="py-2.5 pr-3 text-slate-300 truncate max-w-[200px]">
                        {staff.name}
                      </td>
                      <td className="py-2.5 pr-3 text-right text-slate-400 tabular-nums">
                        {staff.orders}
                      </td>
                      <td className="py-2.5 text-right text-emerald-400 tabular-nums">
                        ${staff.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-sm h-28"
          />
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-sm h-64" />
      {/* Tables skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-sm h-72" />
        <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 backdrop-blur-sm h-72" />
      </div>
    </div>
  );
}
