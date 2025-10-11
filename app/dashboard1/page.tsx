// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Server-side session check
  const session = await auth();
  if (!session) {
    // If user hits dashboard while logged-out, send them to sign-in and
    // come back here after login.
    redirect("/auth/sign-in?callbackUrl=/dashboard");
  }

  // Pull a few things for the UI
  const name = session.user?.name ?? "Welcome";
  const email = session.user?.email ?? "";
  const role = (session.user as any)?.role ?? "USER";

  return (
    <main className="f-container py-8">
      <div className="glass specular rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{email}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur">
            <h2 className="font-medium">Your role</h2>
            <p className="mt-1 text-sm text-muted-foreground">{role}</p>
          </div>

          {/* Example role-based tiles */}
          {role === "ADMIN" ? (
            <div className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur">
              <h2 className="font-medium">Admin quick links</h2>
              <ul className="mt-2 text-sm list-disc pl-4">
                <li>Leads & bookings</li>
                <li>Orders & payouts</li>
                <li>Courses & guides</li>
              </ul>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur">
              <h2 className="font-medium">Your purchases</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Access your guides and courses here.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
