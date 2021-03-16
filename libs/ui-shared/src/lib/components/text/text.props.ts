import React from "react";

import { AsProps, I18nProps } from "../types";

export type TextProps = React.HTMLAttributes<HTMLSpanElement> &
  I18nProps &
  AsProps;
