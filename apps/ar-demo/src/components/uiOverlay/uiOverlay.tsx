import { FlexRow } from "@classifai/ui-shared";
import React from "react";
import styled from "styled-components";

import { UIOverlayProps } from ".";
import ToolBar from "../toolBar/toolBar";

const FullScreenDiv = styled(FlexRow)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const UIOverlay: React.FC<UIOverlayProps> = (props) => {
  const { renderer, ...rest } = props;

  return (
    <FullScreenDiv {...rest}>
      <ToolBar renderer={renderer} />
    </FullScreenDiv>
  );
};

export default UIOverlay;
