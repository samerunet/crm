// components/admin/SignatureCanvas.tsx
'use client';
import React, { useEffect, useRef } from 'react';

export default function SignatureCanvas({
  width = 520,
  height = 180,
  strokeWidth = 2,
  onChange,
  clearSignal,
}: {
  width?: number;
  height?: number;
  strokeWidth?: number;
  onChange?: (dataUrl: string) => void;
  clearSignal?: number; // increment to clear externally
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext('2d')!;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111';

    const getPt = (e: PointerEvent) => {
      const rect = c.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: PointerEvent) => {
      drawing.current = true;
      last.current = getPt(e);
      c.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing.current) return;
      const pt = getPt(e);
      if (!last.current) { last.current = pt; return; }
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      last.current = pt;
    };
    const onUp = (e: PointerEvent) => {
      drawing.current = false;
      last.current = null;
      if (onChange) onChange(c.toDataURL('image/png'));
      c.releasePointerCapture(e.pointerId);
    };

    c.addEventListener('pointerdown', onDown);
    c.addEventListener('pointermove', onMove);
    c.addEventListener('pointerup', onUp);
    c.addEventListener('pointerleave', onUp);
    return () => {
      c.removeEventListener('pointerdown', onDown);
      c.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerup', onUp);
      c.removeEventListener('pointerleave', onUp);
    };
  }, [strokeWidth, onChange]);

  // external clear
  useEffect(() => {
    if (!canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    if (onChange) onChange(c.toDataURL('image/png')); // blank
  }, [clearSignal, onChange]);

  return (
    <div className="rounded-xl border border-border bg-background p-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto rounded bg-white"
      />
    </div>
  );
}
