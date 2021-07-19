import { color, Sheet } from "@visian/ui-shared";
import React, { useCallback } from "react";
import styled from "styled-components";

import { UndoRedoProps } from ".";
import { RedoIcon, UndoIcon } from "../icons";

const Container = styled(Sheet)`
  align-self: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  height: 46px;
  padding: 5px 7px;
  pointer-events: auto;
`;

const IconContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  justify-content: center;
  margin: 5px;
  width: 20px;
  cursor: pointer;

  * {
    fill: ${color("gray")};
  }

  &:active {
    * {
      fill: ${color("text")};
    }
  }
`;

const Separator = styled.div`
  border-left: solid 1px ${color("gray")};
  height: 24px;
  margin: 0 5px;
  opacity: 0.8;
  width: 1px;
`;

const UndoRedo: React.FC<UndoRedoProps> = (props) => {
  const { renderer, ...rest } = props;

  const undo = useCallback(() => {
    renderer.annotation?.undo();
  }, [renderer]);

  const redo = useCallback(() => {
    renderer.annotation?.redo();
  }, [renderer]);

  return (
    <Container {...rest}>
      <IconContainer>
        <UndoIcon onPointerDown={undo} />
      </IconContainer>
      <Separator />
      <IconContainer>
        <RedoIcon onPointerDown={redo} />
      </IconContainer>
    </Container>
  );
};

export default UndoRedo;
