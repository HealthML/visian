import React from "react";

export interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The callback for the button. */
  onClick?: () => void;
}