import type React from "react";

import type { AsProps, RefProps } from "../types";

export type BoxProps = React.HTMLAttributes<HTMLDivElement> &
  AsProps &
  RefProps<HTMLDivElement>;
