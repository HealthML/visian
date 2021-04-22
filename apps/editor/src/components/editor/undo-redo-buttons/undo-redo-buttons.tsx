import { SquareButton } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const UndoRedoContainer = styled.div`
  position: relative;
`;
const UndoRedoWrapper = styled.div`
  display: flex;
  left: 0;
  position: absolute;
  top: 0;
`;
const UndoRedoButton = styled(SquareButton)`
  margin-right: 8px;
`;

export const UndoRedoButtons = observer(() => {
  const store = useStore();

  return (
    <UndoRedoContainer>
      <UndoRedoWrapper>
        <UndoRedoButton
          icon="undo"
          isActive={false}
          isDisabled={!store?.editor.undoRedo.isUndoAvailable}
          onPointerDown={store?.editor.undoRedo.undo}
        />
        <UndoRedoButton
          icon="redo"
          isActive={false}
          isDisabled={!store?.editor.undoRedo.isRedoAvailable}
          onPointerDown={store?.editor.undoRedo.redo}
        />
      </UndoRedoWrapper>
    </UndoRedoContainer>
  );
});
