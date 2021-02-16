import { Sheet } from "@classifai/ui-shared";
import React, { useCallback } from "react";
import styled from "styled-components";

import { UndoRedoProps } from ".";
import { RedoIcon, UndoIcon } from "../icons";

const Container = styled(Sheet)`
  display: flex;
  flex-direction: row;
  margin-left: 10px;
  padding: 5px;
  justify-content: stretch;
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
    fill: gray;
  }

  &:active {
    * {
      fill: darkgray;
    }
  }
`;

const Separator = styled.div`
  border-left: solid 1px gray;
  width: 1px;
  height: 20px;
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
