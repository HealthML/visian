import { MiaAnnotation, MiaImage } from "@visian/utils";

export interface ImageListItemProps {
  image: MiaImage;
  areSomeSelected?: boolean;
  isSelectionHovered?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onDelete?: (image: MiaImage) => void;
  showAnnotations?: boolean;
  onAnnotationDelete?: (annotation: MiaAnnotation) => void;
  annotationsFilter?: (annotation: MiaAnnotation) => boolean;
}
