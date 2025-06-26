import React from "react";

import { ProgressBar } from "./progress-bar";
import { ProgressBarProps } from "./progress-bar.props";

export default {
  cmponent: ProgressBar,
  title: "Progress",
  argTypes: { onEdit: { action: "New Value" } },
};

export const primary = (args: ProgressBarProps) => <ProgressBar {...args} />;
primary.args = {
  total: 42,
  totalLabel: "All Items",
  bars: [
    { label: "Verified", value: 14, color: "Neuronic Neon" },
    { label: "Annotated", value: 26, color: "blueBorder" },
    { label: "Weird Thing", value: 27, color: "Genome Gold" },
    { label: "Other Thing", value: 3, color: "Obviously Orange" },
  ],
};
