import {
  JobsApi,
  DatasetsApi,
  ImagesApi,
  AnnotationsApi,
  ModelVersionsApi,
  ProjectsApi,
} from "mia-api-client";

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

export const hubBaseUrl =
  formatUrl(process.env.NX_ANNOTATION_SERVICE_HUB_URL) ??
  "http://localhost:3000";

const basePath = hubBaseUrl.replace(/\/$/, "");

export const annotationsApi = new AnnotationsApi({ basePath: basePath });
export const imagesApi = new ImagesApi({ basePath: basePath });
export const datasetsApi = new DatasetsApi({ basePath: basePath });
export const jobsApi = new JobsApi({ basePath: basePath });
export const modelVersionsApi = new ModelVersionsApi({ basePath: basePath });
export const projectsApi = new ProjectsApi({ basePath: basePath });

export default hubBaseUrl;
