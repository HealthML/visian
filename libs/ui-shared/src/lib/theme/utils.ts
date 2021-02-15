import { Theme, ThemeProps } from "./theme";

/** Extracts a value from the theme passed to the component. */
export const lookup = <K extends keyof Theme>(themeKey: K) => (
  valueKey: keyof Theme[K],
) => (props: ThemeProps) => {
  const values = props.theme[themeKey];
  if (!values) return valueKey;

  const value = values[valueKey];
  if (value === undefined) return valueKey;
  return value;
};

export const border = lookup("borders");
export const borderStyle = lookup("borderStyles");
export const borderWidths = lookup("borderWidths");
export const color = lookup("colors");
export const font = lookup("fonts");
export const fontSize = lookup("fontSizes");
export const fontWeight = lookup("fontWeights");
export const letterSpacing = lookup("letterSpacings");
export const lineHeight = lookup("lineHeights");
export const mediaQuery = lookup("mediaQueries");
export const radius = lookup("radii");
export const shadow = lookup("shadows");
export const size = lookup("sizes");
export const space = lookup("space");
export const zIndex = lookup("zIndices");

/**
 * Returns the numeric value of a given metric one.
 *
 * @example
 * // Returns 8
 * parseNumberFromMetric("8px");
 */
export const parseNumberFromMetric = (value: string) => {
  const match = value.match(/\d+(\.\d+)?/);
  if (!match) return 0;
  return parseFloat(match[0]);
};

/**
 * Returns the unit of a given metric value.
 *
 * @example
 * // Returns "px"
 * parseUnitFromMetric("8px");
 */
export const parseUnitFromMetric = (value: string) => {
  const match = value.match(/([a-z]+)/);
  if (!match) return "";
  return match[0];
};

/**
 * Returns the metric value scaled by a given factor.
 *
 * @param value The metric value.
 * @param factor The factor to scale by.
 * @example
 * // Returns "16px"
 * scaleMetric("8px", 2);
 */
export const scaleMetric = (value: string, factor: number) =>
  `${parseNumberFromMetric(value) * factor}${parseUnitFromMetric(value)}`;
