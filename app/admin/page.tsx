// app/admin/page.tsx
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "CRM — Admin",
  description: "Lead pipeline, KPI rings, and calendar.",
};

export default function AdminPage() {
  return (
    <main className="f-container py-6 sm:py-8">
      <AdminDashboard />
    </main>
  );
}
