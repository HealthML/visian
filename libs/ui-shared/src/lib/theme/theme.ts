import { ThemeProps as StyledThemeProps } from "styled-components";

const colorModes = {
  light: {
    text: "#000",
    background: "#fff",
    primary: "#00f",
    secondary: "#00a",
    gray: "rgba(0,0,0,0.5)",
    lightGray: "rgba(0,0,0,0.25)",
    veryLightGray: "rgba(0,0,0,0.1)",
    veryveryLightGray: "rgba(0,0,0,0.03)",
    sheet: "rgba(226,226,226,0.6)",
    sheetBorder: "rgba(0, 0, 0, 0.16)",
  },
  dark: {
    text: "#fff",
    background: "#000",
    primary: "#0cf",
    secondary: "#f0e",
    gray: "rgba(255,255,255,0.5)",
    lightGray: "rgba(255,255,255,0.5)",
    veryLightGray: "rgba(255,255,255,0.1)",
    sheet: "rgba(255,255,255,0.1)",
    sheetBorder: "rgba(255, 255, 255, 0.16)",
  },
};

/**
 * The application's theme.
 *
 * @see https://styled-system.com/theme-specification
 */
export const theme = {
  borders: {},
  borderStyles: {},
  borderWidths: {},
  // breakpoints: ["478px", "767px", "991px", "1280px", "1440px", "1920px"],
  colors: colorModes.light,
  fonts: {
    default: "Helvetica Neue",
  },
  fontSizes: {
    tag: "8pt",
    small: "10pt",
    default: "12pt",
    navigation: "13pt",
    subtitle: "20pt",
    title: "24pt",
  },
  fontWeights: {
    bold: "700",
    default: "300",
  },
  letterSpacings: {},
  lineHeights: {},
  mediaQueries: {
    phoneOnly: "@media (max-width: 599px)",
    tabletPortraitUp: "@media (min-width: 600px)",
    tabletLandspaceUp: "@media (min-width: 900px)",
    desktopUp: "@media (min-width: 1200px)",
    bigDesktopUp: "@media (min-width: 1800px)",
    print: "@media print",
  },
  radii: {
    default: "10px",
  },
  shadows: {},
  sizes: {
    icon: "24px",
    iconLarge: "30px",
    maxContentWidth: "940px",
    recordImage: "220px",
  },
  space: {
    iconMargin: "12px",
    listIndentation: "16px",
  },
  zIndices: {},
};

export type ColorMode = keyof typeof colorModes;

export const getTheme = (mode: ColorMode = "light") => ({
  ...theme,
  colors: colorModes[mode] || theme.colors,
});

export type Theme = ReturnType<typeof getTheme>;
export type ThemeProps = StyledThemeProps<Theme>;
