import type React from "react";
import { IconType } from "../icon";

import type { I18nProps } from "../types";

export interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    I18nProps {
  icon?: IconType;

  isActive?: boolean;
}
