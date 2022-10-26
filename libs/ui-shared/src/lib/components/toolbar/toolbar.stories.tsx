import React from "react";

import { Tool, Toolbar } from "./toolbar";

export default {
  component: Toolbar,
  title: "Toolbar",
};

export const primary = () => (
  <Toolbar>
    <Tool icon="pixelBrush" isActive />
    <Tool icon="pixelBrush" />
    <Tool icon="pixelBrush" />
  </Toolbar>
);
