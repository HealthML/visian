import type { StatefulPopUpProps } from "@visian/ui-shared";
import type { MiaAnnotation, MiaImage } from "@visian/utils";

export interface DatasetImageListItemProps extends StatefulPopUpProps {
  isInSelectMode: boolean;
  image: MiaImage;
  refetchImages: () => void;
  isSelected: boolean;
  index: number;
  selectedImages: Set<string>;
  images?: MiaImage[];
  setImageSelection: (imageId: string, selection: boolean) => void;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  isShiftPressed: boolean;
  selectedRange: { start: number; end: number };
  setSelectedRange: React.Dispatch<
    React.SetStateAction<{ start: number; end: number }>
  >;
  deleteAnnotation: (annotation: MiaAnnotation) => void;
  deleteImage: (image: MiaImage) => void;
  isLast: boolean;
}
