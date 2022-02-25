/** Fetches and returns the specified file. */
export const readFileFromURL = async (url: string, useCORSProxy?: boolean) => {
  const response = await fetch(
    // TODO: Most CORS proxies are gone after a while, so we should probably
    // host our own in production.
    // For a list, see https://gist.github.com/jimmywarting/ac1be6ea0297c16c477e17f8fbe51347
    useCORSProxy && new URL(url).host !== window.location.host ? `${url}` : url,
  );
  const blob = await response.blob();
  const urlElements = url.split("/");
  const urlParams = urlElements[urlElements.length - 1].split("?");
  const file = new File([blob], urlParams[0]);
  return file;
};

export const uploadFile = (url: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return fetch(url, {
    method: "POST",
    body: formData,
  });
};
