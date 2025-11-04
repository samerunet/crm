// app/admin/page.tsx
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "CRM — Admin",
  description: "Lead pipeline, KPI rings, and calendar.",
  alternates: { canonical: '/admin' },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
