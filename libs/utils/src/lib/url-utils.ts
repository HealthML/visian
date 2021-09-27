export const isFromWHO = () => {
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get("origin") === "who" && params.get("taskId"));
};

export const isUsingLocalhost = () => window.location.hostname === "localhost";

export const getWHOTaskIdFromUrl = () =>
  new URLSearchParams(window.location.search).get("taskId");

export const reloadWithNewTaskId = (taskId: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set("taskId", taskId);
  window.history.pushState({}, "", url.pathname);

  // TODO: Change logic so that reloading is not necessary
  window.location.reload();
};
