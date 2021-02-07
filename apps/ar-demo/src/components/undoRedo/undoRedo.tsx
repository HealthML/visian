import { Sheet } from "@classifai/ui-shared";
import React from "react";
import styled from "styled-components";

import { UndoRedoProps } from ".";
import { RedoIcon, UndoIcon } from "../icons";

const Container = styled(Sheet)`
  display: flex;
  flex-direction: row;
  margin-left: 10px;
  padding: 5px;
  justify-content: stretch;
`;

const IconContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  justify-content: center;
  margin: 5px;
  width: 20px;

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
  /* margin-top: 5px; */
`;

const UndoRedo: React.FC<UndoRedoProps> = (props) => {
  const { renderer, ...rest } = props;

  return (
    <Container {...rest}>
      <IconContainer>
        <UndoIcon onPointerDown={renderer.undo} />
      </IconContainer>
      <Separator />
      <IconContainer>
        <RedoIcon onPointerDown={renderer.redo} />
      </IconContainer>
    </Container>
  );
};

export default UndoRedo;
