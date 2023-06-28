import type { StatefulPopUpProps } from "@visian/ui-shared";

import { IterableData } from "../../../../types";

export interface GridViewProps<T extends IterableData>
  extends StatefulPopUpProps {
  data: T[];
  imgSrc?: string;
  onClick: (item: T) => void;
  onDelete: (item: T) => void;
  onEdit: (item: T) => void;
}
