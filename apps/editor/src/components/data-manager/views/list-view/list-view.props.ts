import type { IterableData, StatefulPopUpProps } from "@visian/ui-shared";

export interface ListViewProps<T extends IterableData>
  extends StatefulPopUpProps {
  data: T[];
  onClick: (item: T) => void;
  onDelete: (item: T) => void;
  onEdit: (item: T) => void;
}
