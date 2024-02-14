export const isFromWHO = () => {
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get("origin") === "who" && params.get("taskId"));
};

export const isFromMia = () => {
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get("review"));
};

export const isFromDV = () => true;

export const isUsingLocalhost = () => window.location.hostname === "localhost";

export const getTaskIdFromUrl = () =>
  new URLSearchParams(window.location.search).get("taskId");

export const setNewTaskIdForUrl = (taskId: string) => {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("taskId", taskId);
  window.history.pushState({}, "", currentUrl.toString());
};
