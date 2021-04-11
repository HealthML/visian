import React from "react";

export interface NotificationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  titleTx?: string;
  title?: string;

  descriptionTx?: string;
  description?: string;
}
