const formatUrl = (url: string | null | undefined) => {
  if (!url || url === "") {
    return url;
  }
  let formattedUrl = url;
  if (
    !formattedUrl.startsWith("http://") &&
    !formattedUrl.startsWith("https://")
  ) {
    formattedUrl = `http://${formattedUrl}`;
  }
  if (!formattedUrl.endsWith("/")) {
    formattedUrl = `${formattedUrl}/`;
  }
  return formattedUrl;
};

export const hubBaseUrl = formatUrl(process.env.NX_ANNOTATION_SERVICE_HUB_URL);

export default hubBaseUrl;
