// components/admin/theme.ts
// Uses your globals.css tokens; heuristics color stages by name (works with custom stages)
import type { LeadStage, LeadCategory } from './types';

export const CATEGORY_DOT: Record<LeadCategory | 'both', string> = {
  service: 'bg-[color:var(--amber,#b45309)]',
  guide:   'bg-[color:var(--teal,#0f766e)]',
  both:    'bg-[color:var(--gold,#C6A25A)]',
};

// Heuristic badge based on stage text (lowercased)
export function badgeClasses(stage: LeadStage, custom?: string) {
  if (custom) return custom;
  const s = (stage || '').toLowerCase();
  if (s.includes('book'))     return 'bg-[color:var(--sage,#008767)]/18 text-[color:var(--sage,#008767)]';
  if (s.includes('deposit'))  return 'bg-accent/25 text-foreground';
  if (s.includes('trial'))    return 'bg-card text-foreground';
  if (s.includes('confirm'))  return 'bg-accent/25 text-accent-foreground';
  if (s.includes('change'))   return 'bg-popover text-foreground';
  if (s.includes('complete')) return 'bg-card text-foreground';
  if (s.includes('no') && s.includes('show')) return 'bg-destructive/15 text-destructive';
  if (s.includes('lost'))     return 'bg-destructive/25 text-destructive-foreground';
  return 'bg-muted text-muted-foreground';
}
