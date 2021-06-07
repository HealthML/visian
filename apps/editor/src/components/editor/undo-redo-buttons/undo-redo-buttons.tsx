import { TooltipDelayProps, SquareButton } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

const Container = styled.div<{ showUndoRedo?: boolean }>`
  display: ${(props) => (props.showUndoRedo ? "block" : "none")};
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

export const UndoRedoButtons = observer<TooltipDelayProps>((props) => {
  const {
    onPointerEnterButton,
    onPointerLeaveButton,
    shouldForceTooltip,
  } = props;
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
    <Container
      showUndoRedo={
        // TODO: Remove check as soon as undo/redo is correctly updated in the 3D view
        store?.editor.activeDocument?.viewSettings.viewMode !== "3D"
      }
    >
      <Wrapper ref={wrapperRef}>
        <StyledButton
          icon="undo"
          tooltipTx="undo"
          tooltipPosition="right"
          isActive={false}
          isDisabled={!store?.editor.activeDocument?.history.canUndo}
          onPointerDown={store?.editor.activeDocument?.history.undo}
          onPointerEnter={onPointerEnterButton}
          onPointerLeave={onPointerLeaveButton}
          shouldForceTooltip={shouldForceTooltip}
        />
        <StyledButton
          icon="redo"
          tooltipTx="redo"
          tooltipPosition="right"
          isActive={false}
          isDisabled={!store?.editor.activeDocument?.history.canRedo}
          onPointerDown={store?.editor.activeDocument?.history.redo}
          onPointerEnter={onPointerEnterButton}
          onPointerLeave={onPointerLeaveButton}
          shouldForceTooltip={shouldForceTooltip}
        />
      </Wrapper>
    </Container>
  );
});
