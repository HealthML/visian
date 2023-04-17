import React from "react";

export interface UIOverlayMenuProps {
  homeButton?: boolean;
  backButton?: boolean;
  projectViewSwitch?: boolean;
  defaultSwitchSelection?: string;
  main: React.ReactNode;
}
