export const isFromWho = () => {
  const params = new URLSearchParams(window.location.search);

  return params.get("origin") === "who";
};

export const isUsingLocalhost = () => window.location.hostname === "localhost";
