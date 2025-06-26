import React from "react";

import { I18nData } from "../../types";

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  titleTx?: string;
  title?: string;

  descriptionTx?: string;
  descriptionData?: I18nData;
  description?: string;

  onClose?: () => void;
}
