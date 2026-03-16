"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import LiveOrders from "./LiveOrders";
import InventoryManager from "./InventoryManager";
import MenuManager from "./MenuManager";
import DashboardStats from "./DashboardStats";
import OrderHistory from "./OrderHistory";
import UserManager from "./UserManager";
import CashierPOS from "./CashierPOS";
import KitchenDisplay from "./KitchenDisplay";
import PickupQueue from "./PickupQueue";
import LowStockBanner from "./LowStockBanner";
import { useUserRole } from "@/hooks/useUserRole";
import { getVisibleTabs, hasPermission, type AdminTab } from "@/lib/permissions";

const TAB_CONFIG: Record<AdminTab, { label: string; icon: React.ReactNode }> = {
  orders: {
    label: "Orders",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  pos: {
    label: "New Order",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  kitchen: {
    label: "Kitchen",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    ),
  },
  pickup: {
    label: "Pickup",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  inventory: {
    label: "Inventory",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  menu: {
    label: "Menu",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  history: {
    label: "History",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  analytics: {
    label: "Analytics",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  users: {
    label: "Users",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
};

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const userInfo = useUserRole();
  const role = userInfo?.role ?? "cashier";

  const visibleTabs = getVisibleTabs(role);
  const [activeTab, setActiveTab] = useState<AdminTab>(visibleTabs[0] || "orders");

  const handleOrderUpdate = () => {
    setRefreshKey((k) => k + 1);
  };

  const tabs = visibleTabs.map((id) => ({
    id,
    ...TAB_CONFIG[id],
  }));

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/[0.07] rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-violet-600/[0.05] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/[0.04] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/[0.06] bg-slate-900/40 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white text-sm font-display font-bold">Y</span>
              </div>
              <h1 className="font-display text-xl text-white tracking-tight">Yazol</h1>
            </div>
            <div className="h-5 w-px bg-white/10" />
            <span className="text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-indigo-300/80 bg-indigo-500/10 border border-indigo-500/15 rounded-md px-2.5 py-1">
              {role.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400/80 text-sm font-body hidden sm:inline">
              {userInfo?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="text-slate-500 text-sm font-body hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.05]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar + Content Layout */}
      <div className="relative max-w-[1400px] mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 min-h-[calc(100vh-3.5rem)] border-r border-white/[0.06] bg-slate-900/20 backdrop-blur-sm px-3 py-6 sticky top-14 self-start">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-body font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-indigo-600/20 to-violet-600/10 text-white border border-indigo-500/20 shadow-lg shadow-indigo-500/5"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <span className={activeTab === tab.id ? "text-indigo-400" : "text-slate-500"}>{tab.icon}</span>
                {tab.label}
                {tab.id === "pos" && (
                  <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded px-1.5 py-0.5">
                    POS
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Order Flow Visual */}
          <div className="mt-auto pt-6 border-t border-white/[0.06]">
            <p className="text-[10px] font-body font-semibold uppercase tracking-widest text-slate-600 mb-3 px-3">
              Order Flow
            </p>
            <div className="space-y-0 px-3">
              {[
                { label: "Customer", icon: "1" },
                { label: "Cashier", icon: "2" },
                { label: "POS + Payment", icon: "3" },
                { label: "Barista / Kitchen", icon: "4" },
                { label: "Pickup Counter", icon: "5" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2.5">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
                      <span className="text-[9px] font-body font-bold text-slate-500">{step.icon}</span>
                    </div>
                    {i < 4 && <div className="w-px h-3 bg-slate-800" />}
                  </div>
                  <span className="text-[11px] font-body text-slate-500 -mt-0.5">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-white/[0.06] bg-[#0a0e1a]/95 backdrop-blur-xl">
          <div className="flex justify-around px-2 py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "text-indigo-400"
                    : "text-slate-600 hover:text-slate-400"
                }`}
              >
                {tab.icon}
                <span className="text-[9px] font-body font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="mobileTab"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-6 py-6 pb-24 lg:pb-6 min-w-0">
          {/* Dashboard Stats — visible for admin+ roles */}
          {hasPermission(role, "view_dashboard_stats") && activeTab !== "pos" && (
            <DashboardStats refreshKey={refreshKey} />
          )}

          {/* Low stock alerts — visible to all staff */}
          {activeTab !== "pos" && <LowStockBanner />}

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "orders" && hasPermission(role, "view_live_orders") && (
              <LiveOrders onOrderUpdate={handleOrderUpdate} role={role} />
            )}
            {activeTab === "pos" && hasPermission(role, "create_orders") && (
              <CashierPOS onOrderCreated={handleOrderUpdate} />
            )}
            {activeTab === "kitchen" && hasPermission(role, "view_kitchen_display") && (
              <KitchenDisplay onOrderUpdate={handleOrderUpdate} role={role} />
            )}
            {activeTab === "pickup" && hasPermission(role, "view_pickup_queue") && (
              <PickupQueue onOrderUpdate={handleOrderUpdate} role={role} />
            )}
            {activeTab === "inventory" && hasPermission(role, "manage_inventory") && (
              <InventoryManager refreshKey={refreshKey} role={role} />
            )}
            {activeTab === "menu" && hasPermission(role, "manage_menu") && (
              <MenuManager />
            )}
            {activeTab === "history" && hasPermission(role, "view_order_history") && (
              <OrderHistory />
            )}
            {activeTab === "analytics" && hasPermission(role, "view_dashboard_stats") && (
              <DashboardStats refreshKey={refreshKey} />
            )}
            {activeTab === "users" && hasPermission(role, "manage_users") && (
              <UserManager />
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
