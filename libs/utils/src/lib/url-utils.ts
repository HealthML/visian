export const isFromWHO = () => {
  const params = new URLSearchParams(window.location.search);

  return params.get("origin") === "who";
};

export const isUsingLocalhost = () => window.location.hostname === "localhost";

export const getWHOTaskIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("taskId");
};

export const reloadWithNewTaskId = (taskId: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set("taskId", taskId);
  window.history.pushState({}, "", url.pathname);
  // TODO: Change logic so that reload not necessary
  window.location.reload();
};
