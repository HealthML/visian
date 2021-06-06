import {
  DelayHandlingButtonContainerProps,
  SquareButton,
} from "@visian/ui-shared";
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

export const UndoRedoButtons = observer<DelayHandlingButtonContainerProps>(
  (props) => {
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
      <Container>
        <Wrapper ref={wrapperRef}>
          <StyledButton
            icon="undo"
            tooltipTx="undo"
            tooltipPosition="right"
            isActive={false}
            isDisabled={!store?.editor.undoRedo.isUndoAvailable}
            onPointerDown={store?.editor.undoRedo.undo}
            onPointerEnter={onPointerEnterButton}
            onPointerLeave={onPointerLeaveButton}
            shouldForceTooltip={shouldForceTooltip}
          />
          <StyledButton
            icon="redo"
            tooltipTx="redo"
            tooltipPosition="right"
            isActive={false}
            isDisabled={!store?.editor.undoRedo.isRedoAvailable}
            onPointerDown={store?.editor.undoRedo.redo}
            onPointerEnter={onPointerEnterButton}
            onPointerLeave={onPointerLeaveButton}
            shouldForceTooltip={shouldForceTooltip}
          />
        </Wrapper>
      </Container>
    );
  },
);
