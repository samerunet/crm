"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { listUsers, updateUserRole, type UserWithRole } from "@/lib/users";
import { usePollingQuery } from "@/lib/hooks/use-polling-query";
import { useSession } from "next-auth/react";

const shimmer = "animate-pulse bg-[rgba(18,13,10,0.12)]";

function roleLabel(role: string) {
  if (role === "ADMIN") return "Admin";
  if (role === "MANAGER") return "Manager";
  return "User";
}

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "ADMIN", label: "Admins" },
  { id: "MANAGER", label: "Managers" },
  { id: "USER", label: "Users" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function UsersPanel() {
  const { data: session } = useSession();
  const currentRole = (session?.user as any)?.role ?? "USER";
  const canView = currentRole === "ADMIN" || currentRole === "MANAGER";
  const canManage = currentRole === "ADMIN";

  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterId>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data, isLoading, refresh } = usePollingQuery<UserWithRole[]>(listUsers, [], {
    refreshInterval: 0,
    enabled: canView,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!canManage) return;
    const handleFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [canManage, refresh]);

  const users = useMemo(() => data ?? [], [data]);

  const summary = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.ALL += 1;
        if (user.role === "ADMIN") acc.ADMIN += 1;
        else if (user.role === "MANAGER") acc.MANAGER += 1;
        else acc.USER += 1;
        return acc;
      },
      { ALL: 0, ADMIN: 0, MANAGER: 0, USER: 0 } as Record<FilterId, number>,
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (activeFilter === "ALL") return users;
    return users.filter((user) => user.role === activeFilter);
  }, [activeFilter, users]);

  const handleChangeRole = async (userId: string, nextRole: string) => {
    try {
      setError(null);
      await updateUserRole(userId, nextRole);
      void refresh();
    } catch (error) {
      console.error("Failed to update role", error);
      setError(error instanceof Error ? error.message : "Unable to update role");
    }
  };

  if (!canView) return null;

  return (
    <div className="glass-strong space-y-3 rounded-[calc(var(--radius)+14px)] border border-[--color-border]/50 p-4 shadow-[0_20px_48px_rgba(18,13,10,0.18)]">
      <header>
        <div className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Team</div>
        <h2 className="text-sm font-semibold text-[--color-foreground]">User management</h2>
      </header>
      <div className="grid grid-cols-2 gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => {
              setActiveFilter(filter.id);
              setModalOpen(true);
            }}
            className="glass-strong rounded-[calc(var(--radius)+8px)] border border-[--color-border]/40 px-3 py-2 text-left shadow-[0_14px_32px_rgba(18,13,10,0.18)] transition hover:border-[--color-border]"
          >
            <div className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">{filter.label}</div>
            <div className="mt-1 text-lg font-semibold text-[--color-foreground]">{summary[filter.id] ?? 0}</div>
          </button>
        ))}
      </div>
      {error ? (
        <div className="rounded-[calc(var(--radius)+6px)] border border-[--color-border]/50 bg-[rgba(122,48,34,0.15)] px-3 py-2 text-xs text-[--color-foreground]">
          {error}
        </div>
      ) : null}
      {mounted
        ? createPortal(
            <UsersModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              users={filteredUsers}
              loading={isLoading && !data}
              canManage={canManage}
              currentUserId={session?.user?.id}
              onChangeRole={handleChangeRole}
              filterLabel={FILTERS.find((f) => f.id === activeFilter)?.label ?? "Users"}
            />,
            document.body,
          )
        : null}
    </div>
  );
}

 type UsersModalProps = {
   open: boolean;
   onClose: () => void;
   users: UserWithRole[];
   loading: boolean;
   canManage: boolean;
   currentUserId?: string | null;
   onChangeRole: (userId: string, role: string) => void;
   filterLabel: string;
 };

 function UsersModal({ open, onClose, users, loading, canManage, currentUserId, onChangeRole, filterLabel }: UsersModalProps) {
   if (!open) return null;
 
   return (
     <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 px-4 py-10">
       <div className="glass-strong w-full max-w-4xl rounded-[calc(var(--radius)+24px)] border border-[--color-border]/50 p-6 shadow-[0_36px_120px_rgba(18,13,10,0.35)]">
         <header className="flex items-center justify-between">
           <div>
             <div className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">{filterLabel}</div>
             <div className="text-lg font-semibold text-[--color-foreground]">{users.length} user{users.length === 1 ? "" : "s"}</div>
           </div>
           <button type="button" onClick={onClose} className="icon-chip rounded-full px-3 py-1 text-xs">
             Close
           </button>
         </header>
         <div className="mt-4 max-h-[65vh] space-y-2 overflow-y-auto pr-2">
           {loading ? (
             <div className={`${shimmer} h-14 w-full rounded-[calc(var(--radius)+8px)]`} />
           ) : users.length === 0 ? (
             <div className="rounded-[calc(var(--radius)+8px)] border border-dashed border-[--color-border]/50 bg-[rgba(18,13,10,0.08)] px-4 py-5 text-sm text-[--color-muted-foreground]">
               No users in this group yet.
             </div>
           ) : (
             users.map((user) => (
               <div
                 key={user.id}
                 className="glass-strong flex items-start justify-between gap-3 rounded-[calc(var(--radius)+10px)] border border-[--color-border]/40 px-4 py-3 shadow-[0_16px_40px_rgba(18,13,10,0.2)]"
               >
                 <div>
                   <div className="text-sm font-semibold text-[--color-foreground]">{user.name || "—"}</div>
                   <div className="text-xs text-[--color-muted-foreground]">{user.email}</div>
                 </div>
                 <RoleSelect
                   currentRole={user.role}
                   disabled={!canManage || user.id === currentUserId}
                   onChange={(role) => onChangeRole(user.id, role)}
                 />
               </div>
             ))
           )}
         </div>
       </div>
     </div>
   );
 }

 type RoleSelectProps = {
   currentRole: string;
   disabled?: boolean;
   onChange: (role: string) => void;
 };

 function RoleSelect({ currentRole, disabled, onChange }: RoleSelectProps) {
   return (
     <select
       value={currentRole}
       onChange={(event) => onChange(event.target.value)}
       disabled={disabled}
       className="rounded-[calc(var(--radius)+6px)] border border-[--color-border]/50 bg-[rgba(18,13,10,0.08)] px-2 py-1 text-xs text-[--color-foreground]"
     >
       {(["ADMIN", "MANAGER", "USER"] as const).map((role) => (
         <option key={role} value={role}>
           {roleLabel(role)}
         </option>
       ))}
     </select>
   );
 }
