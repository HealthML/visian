import styled, { css } from "styled-components";
import tc from "tinycolor2";

import { isFirefox } from "../../platform-detection";
import { color, computeStyleValue, radius, noise } from "../../theme";
import { SheetProps } from "./sheet.props";

export const sheetNoise = `url(${noise}) left top repeat`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sheetMixin = () => css<any>`
  backdrop-filter: blur(50px);
  background: ${sheetNoise},
    // Firefox does not support a blurred background yet
    ${isFirefox()
        ? computeStyleValue(
            [color("sideViewSheet"), color("background")],
            (sheet, background) => tc.mix(sheet, background, 85).toRgbString(),
          )
        : color("sheet")};
  border: 1px solid ${color("sheetBorder")};
`;

// Placeholder for actual implementation.
export const Sheet = styled.div<SheetProps>`
  ${sheetMixin}

  display: flex;
  flex-direction: column;

  align-items: center;
  border-radius: ${radius("default")};
  justify-content: center;
  cursor: auto;
`;

export default Sheet;
