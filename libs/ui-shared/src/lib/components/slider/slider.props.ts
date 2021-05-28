import type React from "react";
import { MarkerConfig } from "../../types";
import type {
  SerializationMethod,
  SliderConfig,
  SliderVerticalitySettings,
} from "./types";

export interface ThumbProps extends SliderVerticalitySettings {
  /**
   * A [0, 1]-ranged value indicating the thumb's relative position along the
   * slider's main axis.
   */
  position: number;
}

export interface MarkerProps extends ThumbProps {
  color?: string;
  isActive?: boolean;
}

export interface RangeMarkerProps extends SliderVerticalitySettings {
  from: number;
  to: number;

  color?: string;
  isActive?: boolean;
}

export interface SliderProps<T extends number | number[] = number | number[]>
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "onChange" | "defaultValue"
    >,
    SliderConfig {
  defaultValue?: T;
  value?: T;

  /** Configures if and how slider thumbs should be forced to keep their order. */
  enforceSerialThumbs?: SerializationMethod;

  /**
   * A function that is called on every slider value change.
   *
   * @param value The current slider value.
   * @param thumbId The index of the changed thumb (`0` if `value` is not an array).
   * @param thumbValue The numeric value of the changed thumb.
   */
  onChange?: (value: T, thumbId: number, thumbValue: number) => void;

  onStart?: (event: PointerEvent | React.PointerEvent, thumbId: number) => void;
  onEnd?: (event: PointerEvent | React.PointerEvent, thumbId: number) => void;

  /**
   * If `true`, shows a range selection between the first and last thumb on
   * the slider.
   */
  showRange?: boolean;

  showFloatingValueLabel?: boolean;

  /**
   * An optional function that formats the value label text.
   * Defaults to a transformation to a value rounded to 2 decimal places.
   */
  formatValueLabel?: (value: number[]) => string;

  markers?: MarkerConfig[];
}

export interface SliderRangeSelectionProps
  extends Pick<SliderProps, "isInverted" | "isVertical"> {
  /** The slider-relative thumb positions as [0, 1]-ranges values. */
  positions: number[];
}

export interface SliderFieldProps extends Omit<SliderProps, "isVertical"> {
  labelTx?: string;
  label?: string;

  /**
   * If `true`, shows a label with the current slider value.
   * For single-valued sliders, this label will be editable.
   *
   * Defaults to `true`.
   */
  showValueLabel?: boolean;

  /**
   * If `true`, values written to the value label can exceed the slider's
   * value range.
   */
  unlockValueLabelRange?: boolean;
}
