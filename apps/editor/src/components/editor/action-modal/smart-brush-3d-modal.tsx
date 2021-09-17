import { MAX_REGION_GROWING_STEPS } from "@visian/rendering";
import {
  ButtonParam,
  ColorParam,
  Modal,
  ModalHeaderButton,
  NumberParam,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

import type { SmartBrush3D } from "../../../models";

const StyledModal = styled(Modal)`
  margin-top: 16px;
`;

export const SmartBrush3DModal = observer(() => {
  const store = useStore();

  const discard = useCallback(() => {
    (store?.editor.activeDocument?.tools.tools[
      "smart-brush-3d"
    ] as SmartBrush3D).discard();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store]);

  const submit = useCallback(() => {
    (store?.editor.activeDocument?.tools.tools[
      "smart-brush-3d"
    ] as SmartBrush3D).submit();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store]);

  return store?.editor.activeDocument?.tools.regionGrowingRenderer3D
    .holdsPreview ? (
    <StyledModal
      labelTx="smart-brush-3d"
      headerChildren={
        <ModalHeaderButton
          icon="xSmall"
          tooltipTx="discard-region-growing"
          onPointerDown={discard}
        />
      }
    >
      <ColorParam
        labelTx="preview-color"
        isCollapsed
        isFirst
        isLast
        value={
          store?.editor.activeDocument?.tools.regionGrowingRenderer3D
            .previewColor
        }
        setValue={
          store?.editor.activeDocument?.tools.regionGrowingRenderer3D
            .setPreviewColor
        }
      />
      <NumberParam
        labelTx="region-growing-steps"
        min={0}
        max={MAX_REGION_GROWING_STEPS}
        stepSize={1}
        value={
          store?.editor.activeDocument?.tools.regionGrowingRenderer3D.steps
        }
        setValue={
          store?.editor.activeDocument?.tools.regionGrowingRenderer3D.setSteps
        }
      />
      <ButtonParam
        labelTx="submit-3D-region-growing"
        isLast
        handlePress={submit}
      />
    </StyledModal>
  ) : null;
});
