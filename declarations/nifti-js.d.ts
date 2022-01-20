// Very minimal declarations of only what we need.
declare module "nifti-js" {
  export type Unit = "" | "m" | "mm" | "um";
  export const parseHeader: (buffer: ArrayBuffer) => { spaceUnits: Unit[] };
}
