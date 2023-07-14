export const getUrlParam = (name: string, defaultValue: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name) || defaultValue;
};
