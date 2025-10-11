// FILE: app/dashboard/components/ClientGuides.tsx
'use client';
import React from 'react';

export type Guide = { id: string; title: string; access: boolean };

export default function ClientGuides({
  guides,
  onSubscribe,
}: {
  guides: Guide[];
  onSubscribe: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-sm font-semibold mb-2">Your Guides & Courses</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(guides||[]).map(g => (
          <div key={g.id} className="rounded-xl border border-border bg-popover p-3">
            <div className="font-medium">{g.title}</div>
            <div className="text-xs mt-1">{g.access ? 'Active' : 'Not purchased'}</div>
            <div className="mt-2">
              {g.access ? (
                <button className="h-8 px-3 rounded-lg bg-primary text-primary-foreground">Open</button>
              ) : (
                <button className="h-8 px-3 rounded-lg border border-border hover:bg-accent/20" onClick={onSubscribe}>Subscribe</button>
              )}
            </div>
          </div>
        ))}
        {!guides?.length && <div className="text-sm text-muted-foreground">No guides yet.</div>}
      </div>
    </div>
  );
}
