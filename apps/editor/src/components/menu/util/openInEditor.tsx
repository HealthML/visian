import { Annotation, Image } from "../../../types";

export function openInEditor(
  image: Image | null,
  annotation: Annotation | null,
) {
  // save image id in local storage
  const query: string[] = [];
  if (image) {
    sessionStorage.setItem("ImageToOpen", JSON.stringify(image));
    query.push("openImage=true");
  }
  if (annotation) {
    sessionStorage.setItem("AnnotationToOpen", JSON.stringify(annotation));
    query.push("openAnnotation=true");
  }
  // redirect to editor page
  window.location.assign(`/editor?${query.join("&")}`);
}
