import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientDashboard from "./components/ClientDashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/sign-in?callbackUrl=/dashboard");
  }
  const name = session.user?.name ?? "Welcome";
  const email = session.user?.email ?? "";
  const role = (session.user as any)?.role ?? "USER";

  return <ClientDashboard name={name} email={email} role={role} />;
}
