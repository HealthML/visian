import React from "react";

export interface UIOverlayMenuProps {
  backButton?: boolean;
  editButton?: boolean;
  projectViewSwitch?: boolean;
  defaultSwitchSelection?: string;
  main: React.ReactNode;
}
