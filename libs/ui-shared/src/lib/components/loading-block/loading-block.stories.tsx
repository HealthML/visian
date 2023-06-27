import React from "react";

import { LoadingBlock } from "./loading-block";
import { LoadingBlockProps } from "./loading-block.props";

export default {
  component: LoadingBlock,
  title: "Loading Block",
};

export const primary = (args: LoadingBlockProps) => <LoadingBlock {...args} />;
primary.args = {
  height: "200px",
};
