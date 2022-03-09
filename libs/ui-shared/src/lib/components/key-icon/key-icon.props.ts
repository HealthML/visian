import type React from "react";

import { I18nProps } from "../types";

export interface KeyIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    I18nProps {
  isSmall?: boolean;
}
