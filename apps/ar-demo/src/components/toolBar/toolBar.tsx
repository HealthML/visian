import { color, FlexColumn, Sheet } from "@visian/ui-shared";
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
    fill: ${(props) => (props.active ? color("text") : color("gray"))};
  }

  &:active {
    * {
      fill: ${color("text")};
    }
  }
`;

const tools = [Tool.Selection, Tool.Eraser];
const ToolIcons = [SelectIcon, EraserIcon];

const ToolBar: React.FC<ToolBarProps> = (props) => {
  const { renderer, showSettings, toggleSettings, ...rest } = props;

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

  const [isTransformEnabled, setIsTransformEnabled] = useState(false);
  const toggleTransform = useCallback(() => {
    setIsTransformEnabled(!isTransformEnabled);
    renderer.scanNavigator.toggleTransformControls();
    renderer.render();
  }, [renderer, isTransformEnabled, setIsTransformEnabled]);

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
        <ToolContainer active={isTransformEnabled}>
          {/* TODO: Add better icon. */}
          <CrosshairPointer onPointerDown={toggleTransform} />
        </ToolContainer>
        <ToolContainer active={showSettings}>
          <SettingsIcon onPointerDown={toggleSettings} />
        </ToolContainer>
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
