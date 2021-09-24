import {
  BooleanParam,
  ButtonParam,
  Modal,
  ModalHeaderButton,
  NumberParam,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

import type { DilateErodeTool } from "../../../models";

const MAX_STEPS = 12;

const StyledModal = styled(Modal)`
  margin-top: 16px;
`;

export const DilateErodeModal = observer(() => {
  const store = useStore();

  const discard = useCallback(() => {
    (store?.editor.activeDocument?.tools.tools[
      "dilate-erode"
    ] as DilateErodeTool).discard();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store]);

  const submit = useCallback(() => {
    (store?.editor.activeDocument?.tools.tools[
      "dilate-erode"
    ] as DilateErodeTool).submit();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store]);

  const setMaxSteps = useCallback(
    (steps: number) => {
      store?.editor.activeDocument?.tools.dilateErodeRenderer3D.setShouldErode(
        steps < 0,
      );
      store?.editor.activeDocument?.tools.dilateErodeRenderer3D.setMaxSteps(
        Math.abs(steps),
      );

      store?.editor.activeDocument?.tools.dilateErodeRenderer3D.render();
    },
    [store],
  );

  return store?.editor.activeDocument?.tools.dilateErodeRenderer3D
    .holdsPreview ? (
    <StyledModal
      labelTx="dilate-erode-title"
      headerChildren={
        <ModalHeaderButton
          icon="xSmall"
          tooltipTx="discard-dilate-erode"
          onPointerDown={discard}
        />
      }
    >
      <NumberParam
        labelTx="dilate-erode-steps"
        extendBeyondMinMax
        min={-MAX_STEPS}
        max={MAX_STEPS}
        stepSize={1}
        value={
          (store?.editor.activeDocument?.tools.dilateErodeRenderer3D.shouldErode
            ? -1
            : 1) *
          store?.editor.activeDocument?.tools.dilateErodeRenderer3D.maxSteps
        }
        setValue={setMaxSteps}
      />
      <BooleanParam
        labelTx="autocompensate-dilate-erode"
        value={
          store?.editor.activeDocument?.tools.dilateErodeRenderer3D
            .shouldAutoCompensate
        }
        setValue={
          store?.editor.activeDocument?.tools.dilateErodeRenderer3D
            .setShouldAutoCompensate
        }
      />
      <ButtonParam labelTx="submit-dilate-erode" isLast handlePress={submit} />
    </StyledModal>
  ) : null;
});
