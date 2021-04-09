import React, { useCallback, useState } from "react";

import { Icon } from "../icon";
import { Toolbar, Tool } from "./toolbar";

export default {
  component: Toolbar,
  title: "Toolbar",
};

export const primary = () => {
  return (
    <Toolbar>
      <Tool icon="pixelBrush" isActive />
      <Tool icon="pixelBrush" />
      <Tool icon="pixelBrush" />
    </Toolbar>
  );
};
