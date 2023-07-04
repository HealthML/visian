import type { StatefulPopUpProps } from "@visian/ui-shared";
import { Dispatch, SetStateAction } from "react";

import { Image } from "../../../types";

export interface ProjectDataExplorerImageListItemProps
  extends StatefulPopUpProps {
  image: Image;
  index: number;
  images: Image[];
  selectedImages: Set<string>;
  isShiftPressed: boolean;
  selectedRange: { start: number; end: number };
  setSelectedRange: Dispatch<
    SetStateAction<{
      start: number;
      end: number;
    }>
  >;
  setImageSelection: (imageId: string, selection: boolean) => void;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
}
