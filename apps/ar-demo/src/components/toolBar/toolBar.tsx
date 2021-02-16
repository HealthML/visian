import { FlexColumn, Sheet } from "@classifai/ui-shared";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { ToolBarProps } from ".";
import { Tool } from "../../lib/types";
import {
  ClearIcon,
  CrosshairPointer,
  DeleteIcon,
  EraserIcon,
  InvertSelectionIcon,
  SelectIcon,
  SettingsIcon,
} from "../icons";
import Settings from "../settings/settings";

const Container = FlexColumn;

const ToolBarContainer = styled(Sheet)`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  padding: 5px;
  pointer-events: auto;
  position: relative;
`;

interface ToolContainerProps {
  active?: boolean;
}

const ToolContainer = styled.div<ToolContainerProps>`
  align-items: center;
  display: flex;
  height: 20px;
  justify-content: center;
  margin: 5px;
  width: 20px;
  cursor: pointer;

  * {
    fill: ${(props) => (props.active ? "black" : "gray")};
  }

  &:active {
    * {
      fill: darkgray;
    }
  }
`;

const tools = [Tool.Selection, Tool.Eraser];
const ToolIcons = [SelectIcon, EraserIcon];

const ToolBar: React.FC<ToolBarProps> = (props) => {
  const { renderer, ...rest } = props;

  const [activeTool, setActiveTool] = useState<Tool>(Tool.Selection);

  useEffect(() => {
    if (renderer) {
      document.addEventListener("keydown", (event: KeyboardEvent) => {
        switch (event.key.toLowerCase()) {
          case "e":
            setActiveTool(Tool.Eraser);
            renderer.setActiveTool(Tool.Eraser);
            break;
          case "q":
            setActiveTool(Tool.Selection);
            renderer.setActiveTool(Tool.Selection);
            break;
          default:
            break;
        }
      });
    }
  }, [setActiveTool, renderer]);

  const [transformEnabled, setTransformEnabled] = useState(false);
  const toggleTransform = useCallback(() => {
    setTransformEnabled(!transformEnabled);
    renderer.navigator.toggleTransformControls();
    renderer.render();
  }, [renderer, transformEnabled, setTransformEnabled]);

  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
  }, [showSettings, setShowSettings]);

  return (
    <Container {...rest}>
      <ToolBarContainer>
        {tools.map((tool, index) => {
          const Icon = ToolIcons[index];
          return (
            <ToolContainer active={tool === activeTool} key={tool}>
              <Icon
                onPointerDown={() => {
                  renderer.setActiveTool(tool);
                  setActiveTool(tool);
                }}
              />
            </ToolContainer>
          );
        })}
        <ToolContainer active={transformEnabled}>
          {/* Todo: Add better icon. */}
          <CrosshairPointer onPointerDown={toggleTransform} />
        </ToolContainer>
        <ToolContainer active={showSettings}>
          <SettingsIcon onPointerDown={toggleSettings} />
        </ToolContainer>
        {showSettings && <Settings renderer={renderer} />}
      </ToolBarContainer>
      {activeTool === Tool.Selection && (
        <ToolBarContainer>
          <ToolContainer>
            <InvertSelectionIcon onPointerDown={renderer.invertSelection} />
          </ToolContainer>
          <ToolContainer>
            <DeleteIcon onPointerDown={renderer.deleteSelection} />
          </ToolContainer>
          <ToolContainer>
            <ClearIcon onPointerDown={renderer.clearSelection} />
          </ToolContainer>
        </ToolBarContainer>
      )}
    </Container>
  );
};

export default ToolBar;
