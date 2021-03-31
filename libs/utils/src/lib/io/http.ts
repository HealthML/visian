/** Fetches and returns the specified file. */
export const readFileFromURL = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();

  const urlElements = url.split("/");
  return new File([blob], urlElements[urlElements.length - 1]);
};
