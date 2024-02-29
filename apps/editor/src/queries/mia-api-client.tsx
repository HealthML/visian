import {
  AnnotationsApi,
  Configuration,
  DatasetsApi,
  ImagesApi,
  JobsApi,
  ModelVersionsApi,
  ProjectsApi,
} from "@mia-hpi/mia-typescript-sdk";

const formatUrl = (url: string | null | undefined) => {
  if (!url || url === "") {
    return null;
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

const apiConfig = hubBaseUrl
  ? new Configuration({ basePath: hubBaseUrl.replace(/\/$/, "") })
  : undefined;

export const annotationsApi = new AnnotationsApi(apiConfig);
export const imagesApi = new ImagesApi(apiConfig);
export const datasetsApi = new DatasetsApi(apiConfig);
export const jobsApi = new JobsApi(apiConfig);
export const modelVersionsApi = new ModelVersionsApi(apiConfig);
export const projectsApi = new ProjectsApi(apiConfig);

export default hubBaseUrl;
