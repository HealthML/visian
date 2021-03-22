import { color, FlexColumn, Sheet, Text } from "@visian/ui-shared";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { ToolBarProps } from ".";
import { CrosshairPointer, SettingsIcon } from "../icons";

const Container = FlexColumn;

const ToolBarContainer = styled(Sheet)`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  padding: 10px 5px;
  pointer-events: auto;
  position: relative;
  width: 46px;
`;

interface ToolContainerProps {
  active?: boolean;
}

const ToolContainer = styled.div<ToolContainerProps>`
  align-items: center;
  display: flex;
  height: 22px;
  justify-content: center;
  margin: 10px 6px;
  width: 22px;
  cursor: pointer;

  * {
    color: ${(props) => (props.active ? color("text") : color("gray"))};
    fill: ${(props) => (props.active ? color("text") : color("gray"))};
  }

  &:active {
    * {
      color: ${color("text")};
      fill: ${color("text")};
    }
  }
`;

export const ToolBar: React.FC<ToolBarProps> = (props) => {
  const { renderer, showSettings, toggleSettings, ...rest } = props;

  const [isXRAvailable, setIsXRAvailable] = useState<boolean>(false);
  useEffect(() => {
    renderer.isXRAvailable().then((result) => setIsXRAvailable(result));
  }, [renderer, setIsXRAvailable]);

  const toggleFly = useCallback(() => {
    // TODO: Set active & deactivate on fly control unlock
    renderer.toggleFly();
  }, [renderer]);

  const [isInXR, setIsInXR] = useState<boolean>(false);
  const toggleXR = useCallback(() => {
    if (isInXR) {
      renderer.exitXR().then(() => {
        setIsInXR(false);
      });
    } else {
      renderer.enterXR().then(() => {
        setIsInXR(true);
      });
    }
  }, [isInXR, renderer, setIsInXR]);

  return (
    <Container {...rest}>
      <ToolBarContainer>
        <ToolContainer onPointerDown={toggleFly}>
          {/* Todo: Add better icon. */}
          <CrosshairPointer />
        </ToolContainer>
        <ToolContainer active={showSettings} onPointerDown={toggleSettings}>
          <SettingsIcon />
        </ToolContainer>
      </ToolBarContainer>
      {isXRAvailable && (
        <ToolBarContainer>
          <ToolContainer active={isInXR} onPointerDown={toggleXR}>
            <Text>XR</Text>
          </ToolContainer>
        </ToolBarContainer>
      )}
    </Container>
  );
};

export default ToolBar;
