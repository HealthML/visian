import { AbsoluteCover, coverMixin, FlexRow, Text } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { Toolbar } from "../toolbar";
import { UIOverlayProps } from "./ui-overlay.props";

const FullScreenDiv = styled(FlexRow)`
  ${coverMixin}

  align-items: flex-start;
  padding: 12px;
  z-index: 1;
  pointer-events: none;
  user-select: none;
`;

const StartTextContainer = styled(AbsoluteCover)`
  align-items: center;
  display: flex;
  justify-content: center;
  opacity: 0.4;
`;

export const UIOverlay: React.FC<UIOverlayProps> = observer((props) => {
  const { renderer, ...rest } = props;

  return (
    <FullScreenDiv {...rest}>
      <Toolbar renderer={renderer} />
      {!renderer?.isImageLoaded && (
        <StartTextContainer>
          <Text text="Start by dragging in a scan." />
        </StartTextContainer>
      )}
    </FullScreenDiv>
  );
});

export default UIOverlay;
