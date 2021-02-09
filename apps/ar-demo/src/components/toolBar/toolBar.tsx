import { FlexColumn, Sheet } from "@classifai/ui-shared";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { ToolBarProps } from ".";
import { Tool } from "../../lib/types";
import {
  ClearIcon,
  DeleteIcon,
  EraserIcon,
  InvertSelectionIcon,
  SelectIcon,
} from "../icons";

const Container = FlexColumn;

const ToolBarContainer = styled(Sheet)`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  padding: 5px;
  pointer-events: auto;
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
