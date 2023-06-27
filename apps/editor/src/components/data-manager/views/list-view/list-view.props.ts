import type { StatefulPopUpProps } from "@visian/ui-shared";

import { IterableData } from "../../../../types";

export interface ListViewProps<T extends IterableData>
  extends StatefulPopUpProps {
  data: T[];
  onClick: (item: T) => void;
  onDelete: (item: T) => void;
}
