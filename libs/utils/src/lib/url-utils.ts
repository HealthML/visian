export const isFromWHO = () => {
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get("origin") === "who" && params.get("taskId"));
};

export const isUsingLocalhost = () => window.location.hostname === "localhost";

export const getWHOTaskIdFromUrl = () =>
  new URLSearchParams(window.location.search).get("taskId");

export const reloadWithNewTaskId = (taskUrl: string) => {
  const urlElements = taskUrl.split("/");
  const taskId = urlElements[urlElements.length - 1];
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("taskId", taskId);
  window.history.pushState({}, "", currentUrl.pathname);

  // TODO: Change logic so that reloading is not necessary
  window.location.reload();
};
