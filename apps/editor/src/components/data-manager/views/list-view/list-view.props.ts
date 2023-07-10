import type { StatefulPopUpProps } from "@visian/ui-shared";
import type { MiaIterableData } from "@visian/utils";

export interface ListViewProps<T extends MiaIterableData>
  extends StatefulPopUpProps {
  data: T[];
  onClick: (item: T) => void;
  onDelete: (item: T) => void;
  onEdit: (item: T) => void;
}
