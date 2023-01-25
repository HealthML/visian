const formatUrl = (url: string | null | undefined) => {
    if (!url || url == '') {
        return url;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "http://" + url;
    }
    if (!url.endsWith("/")) {
        url = url + "/";
    }
    return url;
}

export const hubBaseUrl = formatUrl(process.env.NX_ANNOTATION_SERVICE_HUB_URL);

export default hubBaseUrl;
