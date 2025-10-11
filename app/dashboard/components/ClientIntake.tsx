// FILE: app/dashboard/components/ClientIntake.tsx
'use client';
import React, { useState, useEffect } from 'react';
import type { Lead } from "@/components/admin/types";

export default function ClientIntake({
  lead,
  onUpdate,
}: {
  lead: Lead;
  onUpdate: (lead: Lead) => void;
}) {
  const [local, setLocal] = useState<Lead>(lead);

  useEffect(()=>{ setLocal(lead); }, [lead]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-sm font-semibold mb-2">Intake Form</div>
      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs">Skin type
            <select className="h-10 rounded-lg px-3 bg-background w-full"
              value={local.intake?.skinType || ''}
              onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), skinType: e.target.value as any }})}>
              <option value="">Choose…</option>
              <option value="dry">Dry</option><option value="oily">Oily</option>
              <option value="combo">Combination</option><option value="normal">Normal</option>
              <option value="sensitive">Sensitive</option>
            </select>
          </label>
          <label className="text-xs">Hair type
            <select className="h-10 rounded-lg px-3 bg-background w-full"
              value={local.intake?.hairType || ''}
              onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), hairType: e.target.value as any }})}>
              <option value="">Choose…</option>
              <option value="straight">Straight</option><option value="wavy">Wavy</option>
              <option value="curly">Curly</option><option value="coily">Coily</option>
              <option value="fine">Fine</option><option value="thick">Thick</option>
            </select>
          </label>
        </div>
        <textarea className="min-h-20 rounded-lg px-3 py-2 bg-background" placeholder="Allergies"
          value={local.intake?.allergies || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), allergies: e.target.value }})}/>
        <textarea className="min-h-20 rounded-lg px-3 py-2 bg-background" placeholder="Preferences"
          value={local.intake?.preferences || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), preferences: e.target.value }})}/>
        <textarea className="min-h-20 rounded-lg px-3 py-2 bg-background" placeholder="Concerns"
          value={local.intake?.concerns || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), concerns: e.target.value }})}/>
        <input className="h-10 rounded-lg px-3 bg-background" placeholder="Reference links (comma separated)"
          value={local.intake?.referenceLinks || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), referenceLinks: e.target.value }})}/>
        <input className="h-10 rounded-lg px-3 bg-background" placeholder="On-site address (if different)"
          value={local.intake?.addressOnSite || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), addressOnSite: e.target.value }})}/>
        <input className="h-10 rounded-lg px-3 bg-background" placeholder="Time window (e.g., arrive by 8:00 AM)"
          value={local.intake?.timeWindow || ''}
          onChange={(e)=>onUpdate({ ...local, intake: { ...(local.intake||{}), timeWindow: e.target.value }})}/>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        Your artist sees updates instantly after you press Save on the page.
      </div>
    </div>
  );
}
