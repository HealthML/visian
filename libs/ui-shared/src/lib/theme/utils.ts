import { css } from "styled-components";
import { Theme, ThemeProps } from "./theme";

/** Extracts a value from the theme passed to the component. */
export const lookup = <TK extends keyof Theme>(themeKey: TK) => <
  VK extends keyof Theme[TK]
>(
  valueKey: VK,
) => ({ theme }: ThemeProps): Theme[TK][VK] | VK => {
  if (!theme) return valueKey;

  const values = theme[themeKey];
  if (!values) return valueKey;

  const value = values[valueKey];
  if (value === undefined) return valueKey;
  return value;
};

export const border = lookup("borders");
export const borderStyle = lookup("borderStyles");
export const borderWidths = lookup("borderWidths");
export const color = lookup("colors");
export const duration = lookup("durations");
export const font = lookup("fonts");
export const fontSize = lookup("fontSizes");
export const fontWeight = lookup("fontWeights");
export const letterSpacing = lookup("letterSpacings");
export const lineHeight = lookup("lineHeights");
export const opacity = lookup("opacities");
export const radius = lookup("radii");
export const shadow = lookup("shadows");
export const size = lookup("sizes");
export const space = lookup("space");
export const zIndex = lookup("zIndices");

export const mediaQuery = (
  key: keyof Theme["mediaQueries"],
  styles?: ReturnType<typeof css>,
) =>
  styles
    ? css`
        ${lookup("mediaQueries")(key)} {
          ${styles}
        }
      `
    : lookup("mediaQueries")(key);

/**
 * Returns the numeric value of a given metric one.
 *
 * @example
 * // Returns 8
 * parseNumberFromMetric("8px");
 */
export const parseNumberFromMetric = (value: string) => {
  const match = value.match(/^(\+|-)?\d+(\.\d+)?/);
  if (!match) return NaN;
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
  const match = value.match(/[a-z]+$/);
  if (!match) return "";
  return match[0];
};

/**
 * Returns the metric value scaled by a given factor.
 *
 * @param value The metric value.
 * @param factor The factor to scale by.
 *
 * @example
 * // Returns "16px"
 * scaleMetric("8px", 2);
 */
export const scaleMetric = (value: string, factor: number) =>
  `${parseNumberFromMetric(value) * factor}${parseUnitFromMetric(value)}`;

export type ComputationInput<P> =
  | string
  | number
  | ((props: P) => string | number);

/**
 * Returns a computed value to be used in styling.
 *
 * @param inputs A single input or an array of inputs.
 * @param computeValue A function that computes the resulting styling value
 * based on the given inputs.
 *
 * @example
 * // Returns "6px"
 * computeStyleValue(["3px", 2], (value, scale) => value * scale)({});
 *
 * @example
 * // Returns half of `theme.sizes.icon`
 * computeStyleValue(size("icon"), (iconSize) => iconSize / 2)(props);
 */
export const computeStyleValue = <
  P = { [key: string]: unknown },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends string | number = any,
  I extends ComputationInput<P> | ComputationInput<P>[] =
    | ComputationInput<P>
    | ComputationInput<P>[]
>(
  inputs: I,
  computeValue: (...values: T[]) => string | number,
) => (props: P): string => {
  // const resolvedValues = Array.isArray(values) ? values : [values];
  const rawInputs = (Array.isArray(inputs)
    ? inputs
    : [inputs]) as ComputationInput<P>[];

  // Resolve function inputs
  const resolvedInputs = rawInputs.map((input) => {
    if (typeof input === "function") {
      return input(props);
    }
    return input;
  });

  // Resolve string inputs
  const convertedInputs = resolvedInputs.map((input) => {
    if (typeof input === "string") {
      const numericInput = parseNumberFromMetric(input);
      if (!Number.isNaN(numericInput)) return numericInput;
    }
    return input;
  });

  const result = computeValue(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(convertedInputs as any),
  );
  return typeof result === "string"
    ? result
    : `${result}${
        typeof resolvedInputs[0] === "string" &&
        resolvedInputs[0].match(/^(\+|-)?\d/)
          ? parseUnitFromMetric(resolvedInputs[0])
          : ""
      }`;
};
