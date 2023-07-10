import type { MiaIterableData, StatefulPopUpProps } from "@visian/ui-shared";

export interface GridViewProps<T extends MiaIterableData>
  extends StatefulPopUpProps {
  data: T[];
  imgSrc?: string;
  onClick: (item: T) => void;
  onDelete: (item: T) => void;
  onEdit: (item: T) => void;
}
