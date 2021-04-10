import { coverMixin, FlexColumn, FlexRow } from "@visian/ui-shared";
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

export const UIOverlay: React.FC<UIOverlayProps> = (props) => {
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
    </FullScreenDiv>
  );
};

export default UIOverlay;
