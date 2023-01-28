import type React from "react";

import type { AsProps, I18nProps } from "../types";

export interface TextProps extends AsProps, I18nProps {
  children?: React.ReactNode;
}
