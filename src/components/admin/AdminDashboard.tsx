"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import LiveOrders from "./LiveOrders";
import InventoryManager from "./InventoryManager";
import MenuManager from "./MenuManager";
import DashboardStats from "./DashboardStats";
import OrderHistory from "./OrderHistory";

type Tab = "orders" | "inventory" | "menu" | "history" | "analytics";

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  const handleOrderUpdate = () => {
    setRefreshKey((k) => k + 1);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "orders", label: "Orders" },
    { id: "inventory", label: "Inventory" },
    { id: "menu", label: "Menu" },
    { id: "history", label: "History" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl text-white">Yazol</h1>
            <span className="text-indigo-400 text-[10px] font-body font-semibold uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 rounded px-2 py-0.5">
              Admin
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-slate-400 text-sm font-body hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="lg:hidden border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-body font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Dashboard Stats — always visible on desktop, shown in Analytics tab on mobile */}
        <div className="hidden lg:block">
          <DashboardStats refreshKey={refreshKey} />
        </div>

        {/* Desktop: grid layout */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6">
          <div className="col-span-3 space-y-6">
            <LiveOrders onOrderUpdate={handleOrderUpdate} />
            <OrderHistory />
          </div>
          <div className="col-span-2 space-y-6">
            <InventoryManager refreshKey={refreshKey} />
            <MenuManager />
          </div>
        </div>

        {/* Mobile: tabbed layout */}
        <div className="lg:hidden">
          {activeTab === "orders" && (
            <LiveOrders onOrderUpdate={handleOrderUpdate} />
          )}
          {activeTab === "inventory" && (
            <InventoryManager refreshKey={refreshKey} />
          )}
          {activeTab === "menu" && <MenuManager />}
          {activeTab === "history" && <OrderHistory />}
          {activeTab === "analytics" && (
            <DashboardStats refreshKey={refreshKey} />
          )}
        </div>
      </main>
    </div>
  );
}
