import { SquareButton } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const Container = styled.div`
  position: relative;
`;
const Wrapper = styled.div`
  display: flex;
  left: 0;
  position: absolute;
  top: 0;
`;
const StyledButton = styled(SquareButton)`
  margin-right: 8px;
`;

export const UndoRedoButtons = observer(() => {
  const store = useStore();

  return (
    <Container>
      <Wrapper>
        <StyledButton
          icon="undo"
          isActive={false}
          isDisabled={!store?.editor.undoRedo.isUndoAvailable}
          onPointerDown={store?.editor.undoRedo.undo}
        />
        <StyledButton
          icon="redo"
          isActive={false}
          isDisabled={!store?.editor.undoRedo.isRedoAvailable}
          onPointerDown={store?.editor.undoRedo.redo}
        />
      </Wrapper>
    </Container>
  );
});
