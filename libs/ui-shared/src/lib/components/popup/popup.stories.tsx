import React from "react";

import { PopUp } from "./popup";
import { PopUpProps } from "./popup.props";

export default {
  component: PopUp,
  title: "PopUp",
};

export const primary = ({ ...args }: PopUpProps) => {
  return <PopUp {...args} />;
};
primary.args = {
  label: "Export",
  filename: "T1.nii",
};
