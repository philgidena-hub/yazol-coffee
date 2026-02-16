import SessionProvider from "@/components/admin/SessionProvider";
import { ToastProvider } from "@/components/admin/AdminToast";
import AdminErrorBoundary from "@/components/admin/AdminErrorBoundary";

export const metadata = {
  title: "Yazol Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <AdminErrorBoundary>
          <div className="min-h-screen bg-slate-950">
            {children}
          </div>
        </AdminErrorBoundary>
      </ToastProvider>
    </SessionProvider>
  );
}
