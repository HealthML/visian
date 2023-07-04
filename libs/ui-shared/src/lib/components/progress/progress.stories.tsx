import React from "react";

import { Progress } from "./progress";
import { ProgressProps } from "./progress.props";

export default {
  cmponent: Progress,
  title: "Progress",
  argTypes: { onEdit: { action: "New Value" } },
};

export const primary = (args: ProgressProps) => <Progress {...args} />;
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
