import { MiaAnnotation, MiaImage } from "@visian/utils";

export interface ImageListProps {
  images: MiaImage[];
  showAnnotations?: boolean;
  selectedImages?: MiaImage[];
  onSelect?: (images: MiaImage[]) => void;
  onImageDelete?: (images: MiaImage[]) => void;
  onAnnotationDelete?: (annotation: MiaAnnotation) => void;
  onStartJob?: (images: MiaImage[]) => void;
  onStartReview?: (images: MiaImage[]) => void;
  annotationsFilter?: (annotation: MiaAnnotation) => boolean;
}
