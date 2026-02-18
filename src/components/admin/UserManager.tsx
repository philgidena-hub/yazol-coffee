"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SafeUser, UserRole } from "@/lib/types";
import { useToast } from "./AdminToast";
import ConfirmModal from "./ConfirmModal";
import { useUserRole } from "@/hooks/useUserRole";

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  cashier: "Cashier",
  chef: "Chef",
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  admin: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30",
  cashier: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  chef: "text-orange-400 bg-orange-400/10 border-orange-400/30",
};

const ROLE_OPTIONS: UserRole[] = ["super_admin", "admin", "cashier", "chef"];

interface FormData {
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

const EMPTY_FORM: FormData = { name: "", username: "", password: "", role: "cashier" };

export default function UserManager() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SafeUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const currentUser = useUserRole();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (user: SafeUser) => {
    setEditingUser(user);
    setFormData({ name: user.name, username: user.username, password: "", role: user.role });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingUser(null);
    setFormData(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (saving) return;

    if (!formData.name.trim()) {
      toast("Name is required", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        const body: Record<string, unknown> = {
          name: formData.name,
          role: formData.role,
        };
        if (formData.password) body.password = formData.password;

        const res = await fetch(`/api/admin/users/${editingUser.username}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast(data.error || "Failed to update user", "error");
          return;
        }

        toast(`User "${formData.name}" updated`, "success");
      } else {
        if (!formData.username.trim()) {
          toast("Username is required", "error");
          return;
        }
        if (!formData.password || formData.password.length < 6) {
          toast("Password must be at least 6 characters", "error");
          return;
        }

        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast(data.error || "Failed to create user", "error");
          return;
        }

        toast(`User "${formData.name}" created`, "success");
      }

      closeForm();
      fetchUsers();
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.username}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "Failed to delete user", "error");
        return;
      }

      toast(`User "${deleteTarget.name}" deleted`, "success");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast("Failed to delete user", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (user: SafeUser) => {
    try {
      const res = await fetch(`/api/admin/users/${user.username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error || "Failed to update user", "error");
        return;
      }

      toast(
        `User "${user.name}" ${user.active ? "deactivated" : "activated"}`,
        "success"
      );
      fetchUsers();
    } catch {
      toast("Failed to update user", "error");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-body font-semibold text-lg text-white">Users</h2>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 bg-indigo-600 text-white font-body text-xs font-medium rounded-md hover:bg-indigo-500 transition-colors"
        >
          + Add User
        </button>
      </div>

      {/* User List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse h-16"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 text-center">
          <p className="text-slate-500 font-body text-sm">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {users.map((user) => (
              <motion.div
                key={user.username}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-body font-medium text-sm text-white truncate">
                          {user.name}
                        </p>
                        {!user.active && (
                          <span className="text-[10px] font-body font-medium text-red-400 bg-red-400/10 border border-red-400/30 rounded px-1.5 py-0.5">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-body text-slate-500 font-mono">
                          @{user.username}
                        </span>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-body font-medium border ${ROLE_COLORS[user.role]}`}
                        >
                          {ROLE_LABELS[user.role]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Toggle active */}
                    {currentUser?.username !== user.username && (
                      <button
                        onClick={() => handleToggleActive(user)}
                        title={user.active ? "Deactivate user" : "Activate user"}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        {user.active ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(user)}
                      title="Edit user"
                      className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Delete */}
                    {currentUser?.username !== user.username && (
                      <button
                        onClick={() => setDeleteTarget(user)}
                        title="Delete user"
                        className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingUser ? "Edit User" : "Create User"}
              </h3>

              <div className="space-y-3">
                {/* Name */}
                <div>
                  <label className="block text-xs font-body font-medium text-slate-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-body font-medium text-slate-400 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData((d) => ({ ...d, username: e.target.value }))}
                    placeholder="username"
                    disabled={!!editingUser}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-body font-medium text-slate-400 mb-1">
                    {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData((d) => ({ ...d, password: e.target.value }))}
                    placeholder={editingUser ? "Leave blank to keep current" : "Min 6 characters"}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-body placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-body font-medium text-slate-400 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData((d) => ({ ...d, role: e.target.value as UserRole }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-body focus:outline-none focus:border-indigo-500"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingUser ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
