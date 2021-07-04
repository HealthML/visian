// TODO: Replace this with dynamic performance monitoring
export const isPerformanceLow = (() => {
  const url = new URL(window.location.href);
  const performance = url.searchParams.get("performance");
  return performance === "low";
})();
