import {
  AbsoluteCover,
  coverMixin,
  FlexColumn,
  FlexRow,
  Text,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import Settings from "../settings/settings";
import { ToolBar } from "../tool-bar";
import { UIOverlayProps } from "./ui-overlay.props";

const FullScreenDiv = styled(FlexRow)`
  ${coverMixin}

  align-items: flex-start;
  padding: 12px;
  z-index: 1;
  pointer-events: none;
  user-select: none;
`;

const UIColumn = styled(FlexColumn)`
  margin-left: 12px;
`;

const StartTextContainer = styled(AbsoluteCover)`
  align-items: center;
  display: flex;
  justify-content: center;
  opacity: 0.4;
`;

export const UIOverlay: React.FC<UIOverlayProps> = observer((props) => {
  const { renderer, ...rest } = props;

  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
  }, [showSettings, setShowSettings]);

  return (
    <FullScreenDiv {...rest}>
      <ToolBar
        renderer={renderer}
        showSettings={showSettings}
        toggleSettings={toggleSettings}
      />
      <UIColumn>{showSettings && <Settings renderer={renderer} />}</UIColumn>
      {!renderer?.isImageLoaded && (
        <StartTextContainer>
          <Text text="Start by dragging in a scan." />
        </StartTextContainer>
      )}
    </FullScreenDiv>
  );
});

export default UIOverlay;
