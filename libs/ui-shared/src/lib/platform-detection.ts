export const isFirefox = () =>
  Boolean(~navigator.userAgent.toLowerCase().indexOf("firefox"));

export const isWindows = () =>
  Boolean(~window.navigator.platform.toLowerCase().indexOf("win"));
