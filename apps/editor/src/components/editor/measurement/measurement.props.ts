import { MeasurementType } from "@visian/ui-shared";
import { Unit } from "nifti-js";

export interface MeasurementProps {
  value: number;
  measurementType: MeasurementType;
  unit?: Unit;
  infoBaseZIndex?: number;
  prefix?: string;
  prefixTx?: string;
  textSize?: "small" | "large";
}
