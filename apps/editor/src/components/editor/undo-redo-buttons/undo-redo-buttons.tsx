import { SquareButton } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
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

  // Ref Management
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    store?.setRef("undoRedoButtons", wrapperRef);

    return () => {
      store?.setRef("undoRedoButtons");
    };
  }, [store, wrapperRef]);

  return (
    <Container>
      <Wrapper ref={wrapperRef}>
        <StyledButton
          icon="undo"
          tooltipTx="undo"
          tooltipPosition="right"
          isActive={false}
          isDisabled={!store?.editor.activeDocument?.history.canUndo}
          onPointerDown={store?.editor.activeDocument?.history.undo}
        />
        <StyledButton
          icon="redo"
          tooltipTx="redo"
          tooltipPosition="right"
          isActive={false}
          isDisabled={!store?.editor.activeDocument?.history.canRedo}
          onPointerDown={store?.editor.activeDocument?.history.redo}
        />
      </Wrapper>
    </Container>
  );
});
