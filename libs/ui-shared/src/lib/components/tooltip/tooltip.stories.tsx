import React from "react";

import { Tooltip } from "./tooltip";
import { TooltipProps } from "./tooltip.props";

export default {
  component: Tooltip,
  title: "Tooltip",
};

export const primary = ({ ...args }: TooltipProps) => <Tooltip {...args} />;
primary.args = {
  label: "Move Tool",
};
