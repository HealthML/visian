export const isFromWHO = () => {
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get("origin") === "who" && params.get("taskId"));
};

export const isInReviewMode = () => {
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get("review")) || isFromWHO();
};

export const isUsingLocalhost = () => window.location.hostname === "localhost";

export const getWHOTaskIdFromUrl = () =>
  new URLSearchParams(window.location.search).get("taskId");

export const setNewTaskIdForUrl = (taskId: string) => {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("taskId", taskId);
  window.history.pushState({}, "", currentUrl.toString());
};
