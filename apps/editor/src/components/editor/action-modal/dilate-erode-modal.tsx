import {
  ButtonParam,
  Modal,
  ModalHeaderButton,
  NumberParam,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";

import { useStore } from "../../../app/root-store";

import type { DilateErodeTool } from "../../../models";

const MAX_STEPS = 50;

export const DilateErodeModal = observer(() => {
  const store = useStore();

  const discard = useCallback(() => {
    store?.editor.activeDocument?.tools.dilateErodeRenderer3D.discard();
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
    },
    [store],
  );

  return store?.editor.activeDocument?.tools.dilateErodeRenderer3D
    .holdsPreview ? (
    <Modal
      labelTx="dilate-erode"
      headerChildren={
        <ModalHeaderButton
          icon="xSmall"
          tooltipTx="discard-region-growing"
          onPointerDown={discard}
        />
      }
    >
      <NumberParam
        labelTx="region-growing-steps"
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
        onEnd={store?.editor.activeDocument?.tools.dilateErodeRenderer3D.render}
      />
      <ButtonParam
        labelTx="submit-3D-region-growing"
        isLast
        handlePress={submit}
      />
    </Modal>
  ) : null;
});
