"use client";
export default function Kpis() {
  const items = [
    { label: "New Leads", value: "32" },
    { label: "Appointments", value: "14" },
    { label: "Deliveries", value: "6" },
    { label: "Response Time", value: "12m" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((i) => (
        <div key={i.label} className="glass rounded-[--radius-xl] p-3">
          <div className="text-xs opacity-80">{i.label}</div>
          <div className="text-xl font-semibold">{i.value}</div>
        </div>
      ))}
    </div>
  );
}
