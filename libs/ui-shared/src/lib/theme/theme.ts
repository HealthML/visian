import { action, makeObservable, observable } from "mobx";
import { ThemeProps as StyledThemeProps } from "styled-components";

const dataColors = {
  "Genome Gold": "#FFC700",
  "Neuronic Neon": "#68D09E",
  "Salient Safran": "#E1FA47",
  "Frontal Flamingo": "#FF6B93",
  "Smart Sapphire": "#3269F5",
  "Obviously Orange": "#FF6B00",

  "Mighty Mercury": "#FFFFFF",
  "Augmented Aqua": "#69F5F5",
  "Visian Vanilla": "#FFE998",
  "Matter Magenta": "#CF52E3",
  "Posterior Plum": "#7B386D",
  "Beamy Bronze": "#8E4B19",
};

const badgeColors = {
  blueBadgeBackground: "rgba(0, 133, 255, 0.05)",
  redBadgeBackground: "rgba(202, 51, 69, 0.1)",
  greenBadgeBackground: "rgba(4, 156, 109, 0.1)",
  orangeBadgeBackground: "rgba(255, 107, 0, 0.1)",
  greenBadgeBorder: "rgba(4, 156, 109, 0.5)",
  orangeBadgeBorder: "rgba(255, 107, 0, 0.5)",
};

export const badgeColorKeys = Object.keys(
  badgeColors,
) as (keyof typeof badgeColors)[];

export const dataColorKeys = Object.keys(
  dataColors,
) as (keyof typeof dataColors)[];

const colorModes = {
  light: {
    text: "rgba(0,0,0,0.8)",
    textReverse: "rgba(1,1,1,0.8)",
    lightText: "rgba(0,0,0,0.4)",
    background: "#fff",
    foreground: "#000",
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
    green: "#049C6D",
    red: "#CA3345",
    redSheet: "rgba(202,51,69,0.3)",
    redBorder: "rgba(202,51,69,0.5)",
    redBorderFocus: "rgba(202,51,69,1)",
    greenSheet: "rgba(43,255,1,0.4)",
    greenBorder: "rgba(10,210,42,0.6)",
    greenBorderFocus: "rgba(10,210,42,1)",
    blueSheet: "rgba(0,133,255,0.4)",
    blueBorder: "rgba(0,133,255,0.6)",
    blueBorderFocus: "rgba(0,133,255,1)",
    sideViewSheet: "rgba(200,200,200,0.4)",
    sideViewBorder: "rgba(0,0,0,0.3)",

    ...dataColors,
    ...badgeColors,
    "Mighty Mercury": "#000000",
  },
  dark: {
    text: "rgba(255,255,255,0.8)",
    textFull: "rgba(0,0,0,0.8)",
    lightText: "rgba(255,255,255,0.4)",
    background: "#0C0E1B",
    foreground: "#fff",
    primary: "#0cf",
    secondary: "#f0e",
    gray: "rgba(255,255,255,0.5)",
    lightGray: "rgba(255,255,255,0.3)",
    veryLightGray: "rgba(255,255,255,0.1)",
    veryVeryLightGray: "rgba(255, 255, 255, 0.05)",
    sheet: "rgba(78, 80, 89, 0.4)",
    sheetBorder: "rgba(255, 255, 255, 0.3)",
    placeholder: "rgba(255, 255, 255, 0.2)",
    modalUnderlay: "rgba(12, 14, 27, 0.8)",
    green: "#049C6D",
    red: "#CA3345",
    redSheet: "rgba(202,51,69,0.3)",
    redBorder: "rgba(202,51,69,0.5)",
    redBorderFocus: "rgba(202,51,69,1)",
    blueSheet: "rgba(0,133,255,0.4)",
    blueBorder: "rgba(0,133,255,0.6)",
    blueBorderFocus: "rgba(0,133,255,1)",
    greenSheet: "rgba(43,255,1,0.4)",
    greenBorder: "rgba(10,210,42,0.6)",
    greenBorderFocus: "rgba(10,210,42,1)",
    sideViewSheet: "rgba(78,80,89,0.2)",
    sideViewBorder: "rgba(255,255,255,0.3)",

    ...dataColors,
    ...badgeColors,
  },
};

/**
 * The application's theme.
 *
 * @see https://styled-system.com/theme-specification
 */
export const theme = {
  /**
   * The id of the applications root element for absolutely positioned overlays
   * such as modals or tooltips.
   *
   * This should not change while the application is running.
   * Unset it here if you are not using a dedicated modal root.
   */
  modalRootId: "modal-root",

  borders: {},
  borderStyles: {},
  borderWidths: {},
  colors: colorModes.light,
  durations: {
    tooltipDelay: 400,
    noTooltipDelayInterval: 1000,
    autoHideDelay: 800,
  },
  fonts: {
    default: "DINPRO",
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
  opacities: {
    inactiveIcon: 0.4,
  },
  radii: {
    activeLayerBorderRadius: "8px",
    default: "10px",
  },
  shadows: {},
  sizes: {
    dividerHeight: "1px",
    icon: "24px",
    iconLarge: "30px",
    listElementHeight: "40px",
    maxContentWidth: "940px",
    recordImage: "220px",
    buttonHeight: "40px",
    sliderHeight: "30px",
    sliderThumbWidth: "2px",
    sliderThumbHeight: "22px",
    sliderMarkerWidth: "2px",
    sliderMarkerHeight: "10px",
    sliderMarkerRangeHeight: "4px",
  },
  space: {
    iconMargin: "12px",
    listIndentation: "16px",
    buttonPadding: "12px 20px",
    inputPadding: "9px 16px",
    sliderLabelDistance: "16px",
    sliderMarkerMargin: "0px",
    pageSectionMargin: "32px",
    pageSectionMarginSmall: "14px",
    listPadding: "4px 14px",
  },
  zIndices: {
    modal: 50,
    picker: 80,
    info: 90,
    overlay: 100,
    overlayComponent: 120,
    notification: 150,
  },
};

export type ColorMode = keyof typeof colorModes;

export const getTheme = (mode: ColorMode = "light") =>
  makeObservable(
    {
      ...theme,
      colors: colorModes[mode] || theme.colors,
      shouldForceTooltip: false,
      setShouldForceTooltip(shouldForceTooltip: boolean) {
        this.shouldForceTooltip = shouldForceTooltip;
      },
    },
    {
      colors: observable,
      shouldForceTooltip: observable,
      setShouldForceTooltip: action,
    },
  );

export type Theme = ReturnType<typeof getTheme>;
export type ThemeProps = StyledThemeProps<Theme>;
