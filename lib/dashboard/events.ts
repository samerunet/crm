export const DASHBOARD_DATA_EVENT = "dashboard:data-changed";

export const emitDashboardDataChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DASHBOARD_DATA_EVENT));
};
