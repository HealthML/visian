import React from "react";
import styled from "styled-components";

import { color, fontWeight, zIndex } from "../../theme";
import { Sheet } from "../sheet";
import { Title } from "../text";
import { PopUpProps } from "./popup.props";

const PopUpContainer = styled(Sheet)`
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  overflow: hidden;
  padding: 30px 40px;
  pointer-events: auto;

  min-width: 600px;
  z-index: ${zIndex("overlay")};

  position: relative;
`;
const PopUpTitle = styled(Title)`
  display: block;
  flex: 1;
  font-size: 28px;
  font-weight: ${fontWeight("regular")};
  line-height: 28px;
`;

const SecondaryPopUpTitle = styled(Title)`
  display: block;
  font-size: 28px;
  font-weight: ${fontWeight("regular")};
  line-height: 28px;
  color: ${color("lightText")};
`;

const TitleRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-bottom: 30px;
  width: 100%;
`;

export const PopUp: React.FC<PopUpProps> = ({
  labelTx,
  label,
  secondaryLabel,
  secondaryLabelTx,
  children,
  ...rest
}) => (
  <PopUpContainer {...rest}>
    {(labelTx || label) && (
      <TitleRow>
        <PopUpTitle tx={labelTx} text={label} />
        <SecondaryPopUpTitle tx={secondaryLabelTx} text={secondaryLabel} />
      </TitleRow>
    )}
    {children}
  </PopUpContainer>
);
