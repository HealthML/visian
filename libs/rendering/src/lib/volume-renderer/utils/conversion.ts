import { ShadingMode } from "@visian/ui-shared";

export const transferFunctionNameToId = (name: string) =>
  ["density", "fc-edges", "fc-cone", "custom"].indexOf(name);

export const shadingModeNameToId = (name: ShadingMode) =>
  ["none", "phong", "lao"].indexOf(name);
