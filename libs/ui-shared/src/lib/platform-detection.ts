export const isFirefox = () =>
  ~navigator.userAgent.toLowerCase().indexOf("firefox");

export const isWindows = () =>
  ~window.navigator.platform.toLowerCase().indexOf("win");
