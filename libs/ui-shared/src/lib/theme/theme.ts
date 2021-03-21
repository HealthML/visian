import { ThemeProps as StyledThemeProps } from "styled-components";
import { makeObservable, observable } from "mobx";

const colorModes = {
  light: {
    text: "#000",
    background: "#fff",
    primary: "#00f",
    secondary: "#00a",
    gray: "rgba(0,0,0,0.5)",
    lightGray: "rgba(0,0,0,0.25)",
    veryLightGray: "rgba(0,0,0,0.1)",
    veryVeryLightGray: "rgba(0,0,0,0.03)",
    sheet: "rgba(200,200,200,0.4)",
    sheetBorder: "rgba(50, 50, 50, 0.3)",
    placeholder: "rgba(0, 0, 0, 0.2)",
    modalUnderlay: "rgba(255, 255, 255, 0.8)",
  },
  dark: {
    text: "#fff",
    background: "#0C0E1B",
    primary: "#0cf",
    secondary: "#f0e",
    gray: "rgba(255,255,255,0.5)",
    lightGray: "rgba(255,255,255,0.5)",
    veryLightGray: "rgba(255,255,255,0.1)",
    sheet: "rgba(255,255,255,0.1)",
    sheetBorder: "rgba(255, 255, 255, 0.3)",
    placeholder: "rgba(255, 255, 255, 0.2)",
    modalUnderlay: "rgba(12, 14, 27, 0.8)",
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
    default: "DIN2014",
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
  lineHeights: {
    sliderTrack: "1px",
  },
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
    buttonHeight: "46px",
    sliderHeight: "30px",
    sliderThumbWidth: "2px",
    sliderThumbHeight: "22px",
  },
  space: {
    iconMargin: "12px",
    listIndentation: "16px",
    buttonPadding: "12px 40px",
    inputPadding: "12px 22px",
  },
  zIndices: {},
};

export type ColorMode = keyof typeof colorModes;

export const getTheme = (mode: ColorMode = "light") =>
  makeObservable(
    {
      ...theme,
      colors: colorModes[mode] || theme.colors,
    },
    { colors: observable },
  );

export type Theme = ReturnType<typeof getTheme>;
export type ThemeProps = StyledThemeProps<Theme>;
