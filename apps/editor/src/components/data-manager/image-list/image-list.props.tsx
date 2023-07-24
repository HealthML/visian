import { Annotation, Image } from "../../../types";

export interface ImageListProps {
  images: Image[];
  showAnnotations?: boolean;
  selectedImages?: Image[];
  onSelect?: (images: Image[]) => void;
  onImageDelete?: (images: Image[]) => void;
  onAnnotationDelete?: (annotation: Annotation) => void;
  onStartJob?: (images: Image[]) => void;
  annotationsFilter?: (annotation: Annotation) => boolean;
}
