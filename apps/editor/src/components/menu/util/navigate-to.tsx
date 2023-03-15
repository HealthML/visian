export function editorPath(image?: string, annotation?: string) {
  if (!image && !annotation) return "/editor";

  const query: string[] = [];
  if (image) {
    query.push(`imageId=${image}`);
  }
  if (annotation) {
    query.push(`annotationId=${annotation}`);
  }
  return `/editor?${query.join("&")}`;
}
