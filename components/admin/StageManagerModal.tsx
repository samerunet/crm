// components/admin/StageManagerModal.tsx
// Edit pipeline stages (add / rename / delete / reorder)
'use client';
import React, { useState } from 'react';
import type { LeadStage } from './types';

export default function StageManagerModal({
  open,
  stages,
  onClose,
  onSave,
}: {
  open: boolean;
  stages: LeadStage[];
  onClose: () => void;
  onSave: (stages: LeadStage[]) => void;
}) {
  const [list, setList] = useState<LeadStage[]>(stages);
  if (!open) return null;

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl rounded-2xl shadow-2xl bg-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="text-lg font-semibold">Pipeline Stages</div>
          <button onClick={onClose} className="px-2 py-1 rounded hover:bg-accent/20">✕</button>
        </div>
        <div className="p-4 space-y-3">
          {list.map((s, i) => (
            <div key={`${s}-${i}`} className="flex items-center gap-2">
              <input className="flex-1 rounded border border-border px-3 py-2 bg-popover" value={s} onChange={(e)=> {
                const next = [...list]; next[i] = e.target.value; setList(next);
              }} />
              <button className="px-2 py-1 rounded border border-border bg-card" onClick={()=> move(i, -1)}>↑</button>
              <button className="px-2 py-1 rounded border border-border bg-card" onClick={()=> move(i, +1)}>↓</button>
              <button className="px-2 py-1 rounded border border-border bg-card" onClick={()=> setList(list.filter((_,k)=>k!==i))}>🗑</button>
            </div>
          ))}
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded border border-border bg-card" onClick={()=> setList([...list, 'new stage'])}>+ Add stage</button>
            <div className="flex-1" />
            <button className="px-4 py-2 rounded bg-primary text-primary-foreground" onClick={()=> { onSave(list.filter(Boolean).map((s)=>s.trim()).filter(Boolean)); onClose(); }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
