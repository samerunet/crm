"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, BarChart3, Settings, Users, ListChecks, Home, NotebookPen } from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/leads", label: "Leads", icon: NotebookPen },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-[--radius-xl] gbtn grid place-items-center">SV</div>
        <div className="font-semibold tracking-wide">CRM</div>
      </div>
      <nav className="space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-[--radius-lg] transition",
                active
                  ? "bg-[rgba(18,13,10,.16)] border border-[rgba(138,110,77,.68)]"
                  : "hover:bg-[rgba(18,13,10,.10)] border border-transparent",
              ].join(" ")}
            >
              <Icon className="size-4 opacity-90" />
              <span className="text-sm">{label}</span>
              {active && <span className="ml-auto w-1 h-5 rounded-full bg-[--color-primary]" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
