import type { StatefulPopUpProps } from "@visian/ui-shared";

import { IterableData } from "../../../types";

export interface GridViewProps extends StatefulPopUpProps {
  data: IterableData[];
  imgSrc?: string;
  onClick: (item: IterableData) => void;
  onDelete: (item: IterableData) => void;
}
