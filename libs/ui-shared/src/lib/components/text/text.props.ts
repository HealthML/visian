import type React from "react";

import type { AsProps, I18nProps } from "../types";

export type TextProps = React.HTMLAttributes<HTMLSpanElement> &
  I18nProps &
  AsProps;
