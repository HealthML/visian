import { Annotation , Image } from "@visian/mia-api";
import type { StatefulPopUpProps } from "@visian/ui-shared";


export interface DatasetImageListItemProps extends StatefulPopUpProps {
  isInSelectMode: boolean;
  image: Image;
  refetchImages: () => void;
  isSelected: boolean;
  index: number;
  selectedImages: Set<string>;
  images?: Image[];
  setImageSelection: (imageId: string, selection: boolean) => void;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  isShiftPressed: boolean;
  selectedRange: { start: number; end: number };
  setSelectedRange: React.Dispatch<
    React.SetStateAction<{ start: number; end: number }>
  >;
  deleteAnnotation: (annotation: Annotation) => void;
  deleteImage: (image: Image) => void;
  isLast: boolean;
}
