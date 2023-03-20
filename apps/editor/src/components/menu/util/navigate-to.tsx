export function editorPath(
  imageId?: string,
  annotationId?: string,
  projectId?: string,
  datasetId?: string,
): string {
  const params = new URLSearchParams();
  if (imageId) {
    params.append("imageId", imageId);
  }
  if (annotationId) {
    params.append("annotationId", annotationId);
  }
  if (projectId) {
    params.append("projectId", projectId);
  }
  if (datasetId) {
    params.append("datasetId", datasetId);
  }
  return `/editor?${params.toString()}`;
}
