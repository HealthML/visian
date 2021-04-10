import { ThemeProps as StyledThemeProps } from "styled-components";
import { makeObservable, observable } from "mobx";

const colorModes = {
  light: {
    text: "rgba(0,0,0,0.8)",
    lightText: "rgba(0,0,0,0.5)",
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
    redSheet: "rgba(202,51,69,0.3)",
    redBorder: "rgba(202,51,69,0.5)",
    blueSheet: "rgba(0,133,255,0.4)",
    blueBorder: "rgba(0,133,255,0.6)",
    sideViewSheet: "rgba(0, 0, 0, 0.05)",
    sideViewBorder: "rgba(0, 0, 0, 0.3)",
  },
  dark: {
    text: "rgba(255,255,255,0.8)",
    lightText: "rgba(255,255,255,0.4)",
    background: "#0C0E1B",
    primary: "#0cf",
    secondary: "#f0e",
    gray: "rgba(255,255,255,0.5)",
    lightGray: "rgba(255,255,255,0.3)",
    veryLightGray: "rgba(255,255,255,0.1)",
    sheet: "rgba(255,255,255,0.1)",
    sheetBorder: "rgba(255, 255, 255, 0.3)",
    placeholder: "rgba(255, 255, 255, 0.2)",
    modalUnderlay: "rgba(12, 14, 27, 0.8)",
    redSheet: "rgba(202,51,69,0.3)",
    redBorder: "rgba(202,51,69,0.5)",
    blueSheet: "rgba(0,133,255,0.4)",
    blueBorder: "rgba(0,133,255,0.6)",
    sideViewSheet: "rgba(255, 255, 255, 0.05)",
    sideViewBorder: "rgba(255, 255, 255, 0.3)",
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
    regular: "400",
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
    buttonHeight: "40px",
    sliderHeight: "30px",
    sliderThumbWidth: "2px",
    sliderThumbHeight: "22px",
  },
  space: {
    iconMargin: "12px",
    listIndentation: "16px",
    buttonPadding: "12px 20px",
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
