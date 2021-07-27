import {
  ButtonParam,
  ColorParam,
  Modal,
  ModalHeaderButton,
  NumberParam,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";

import { useStore } from "../../../app/root-store";

import type { SmartBrush3D } from "../../../models";

export const ActionModal = observer(() => {
  const store = useStore();

  const submit = useCallback(() => {
    (store?.editor.activeDocument?.tools.tools[
      "smart-brush-3d"
    ] as SmartBrush3D).submit();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store]);

  return store?.editor.activeDocument?.tools.regionGrowingRenderer3D
    .holdsPreview ? (
    <Modal
      labelTx="smart-brush-3d"
      headerChildren={
        <ModalHeaderButton
          icon="xSmall"
          tooltipTx="discard-region-growing"
          onPointerDown={
            store?.editor.activeDocument?.tools.regionGrowingRenderer3D.discard
          }
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
        max={244}
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
    </Modal>
  ) : null;
});
