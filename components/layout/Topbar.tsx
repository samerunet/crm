"use client";
import { useUiStore } from "@/lib/ui/use-ui-store";
import Sidebar from "./Sidebar";
import { Menu, Plus } from "lucide-react";

export default function Topbar() {
  const { toggleSidebar, mobileSidebarOpen, closeSidebar } = useUiStore();
  return (
    <>
      <div className="glass-strong rounded-[--radius-xl] px-3 py-2 flex items-center gap-3">
        <button aria-label="Open menu" className="lg:hidden icon-chip px-2 py-1 rounded-[--radius-md]" onClick={toggleSidebar}>
          <Menu className="size-4" />
        </button>
        <h1 className="text-base font-semibold">Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <button className="gbtn rounded-[--radius-lg] px-3 py-1.5 text-sm inline-flex items-center gap-2">
            <Plus className="size-4" />
            New Lead
          </button>
          <div className="size-8 rounded-full bg-[rgba(18,13,10,.16)] border border-[rgba(138,110,77,.68)]" />
        </div>
      </div>
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeSidebar} aria-hidden="true" />
          <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-xs glass-strong rounded-r-[--radius-xl] p-3 overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
}
