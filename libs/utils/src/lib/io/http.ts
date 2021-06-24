/** Fetches and returns the specified file. */
export const readFileFromURL = async (url: string, useCORSProxy?: boolean) => {
  const response = await fetch(
    // TODO: Most CORS proxies are gone after a while, so we should probably
    // host our own in production.
    // For a list, see https://gist.github.com/jimmywarting/ac1be6ea0297c16c477e17f8fbe51347
    useCORSProxy ? `https://cors.bridged.cc/${url}` : url,
  );
  const blob = await response.blob();

  const urlElements = url.split("/");
  return new File([blob], urlElements[urlElements.length - 1]);
};
