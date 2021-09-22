export const isFromWHO = () => {
  const params = new URLSearchParams(window.location.search);

  return params.get("origin") === "who";
};

export const isUsingLocalhost = () => window.location.hostname === "localhost";

export const getWHOTaskIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("taskId");
};
