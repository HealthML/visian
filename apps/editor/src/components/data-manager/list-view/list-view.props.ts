import type { StatefulPopUpProps } from "@visian/ui-shared";

import { IterableData } from "../../../types";

export interface ListViewProps extends StatefulPopUpProps {
  data: IterableData[];
  onClick: (item: IterableData) => void;
  onDelete: (item: IterableData) => void;
}
