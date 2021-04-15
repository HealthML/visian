import { createGlobalStyle } from "styled-components";

import boldFont from "./fonts/DIN2014-DemiBold.ttf";
import regularFont from "./fonts/DIN2014-Regular.ttf";
import lightFont from "./fonts/DIN2014-Light.ttf";
import { ThemeProps } from "./theme";
import { color, font, fontSize, fontWeight } from "./utils";

export interface GlobalStylesProps {
  backgroundColor?: string;
  color?: string;
}

export const GlobalStyles = createGlobalStyle<GlobalStylesProps & ThemeProps>`
  @font-face {
    font-family: 'DIN2014';
    src: local('DIN2014 DemiBold'), url(${boldFont});
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'DIN2014';
    src: local('DIN2014 Regular'), url(${regularFont});
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'DIN2014';
    src: local('DIN2014 Light'), url(${lightFont});
    font-weight: 300;
    font-style: normal;
  }


  html {
    height: 100%;
    margin: 0;
    padding: 0;
  }
  body {
    background-color: ${color("background")};
    color: ${color("text")};
    font-family: ${font("default")};
    font-size: ${fontSize("default")};
    font-weight: ${fontWeight("default")};
    height: 100%;
    margin: 0;
    max-height: 100%;
    overflow: hidden;
    padding: 0;
  }
  main,
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  hr {
    margin: 0;
  }

  input {
    border-radius: 0;
  }

  #root {
    height: 100%;
    max-height: 100%;
    overflow: hidden;
  }
`;
