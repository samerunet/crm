// app/admin/page.tsx
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "CRM — Admin",
  description: "Lead pipeline, KPI rings, and calendar.",
  alternates: { canonical: '/admin' },
};

export default function AdminPage() {
  return (
    <div className="f-container section-y">
      <div className="glass-strong rounded-[calc(var(--radius)+18px)] border border-[--color-border]/40 p-6 shadow-[0_32px_80px_rgba(18,13,10,0.22)] md:p-10">
        <AdminDashboard />
      </div>
    </div>
  );
}
