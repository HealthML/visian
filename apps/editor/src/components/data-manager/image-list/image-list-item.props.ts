import { Annotation, Image } from "../../../types";

export interface ImageListItemProps {
  image: Image;
  areSomeSelected?: boolean;
  isSelectionHovered?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onDelete?: (image: Image) => void;
  showAnnotations?: boolean;
  onAnnotationDelete?: (annotation: Annotation) => void;
  annotationsFilter?: (annotation: Annotation) => boolean;
}
