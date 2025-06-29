import {
  ButtonParam,
  ColorParam,
  Modal,
  ModalHeaderButton,
  NumberRangeParam,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import type { ThresholdAnnotationTool } from "../../../models";

const StyledModal = styled(Modal)`
  margin-top: 16px;
`;

export const ThresholdAnnotationModal = observer(() => {
  const store = useStore();

  const discard = useCallback(() => {
    (
      store?.editor.activeDocument?.tools.tools[
        "threshold-annotation"
      ] as ThresholdAnnotationTool
    ).discard();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store]);

  const submit = useCallback(() => {
    (
      store?.editor.activeDocument?.tools.tools[
        "threshold-annotation"
      ] as ThresholdAnnotationTool
    ).submit();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store]);

  const setThreshold = useCallback(
    (threshold: [number, number]) => {
      store?.editor.activeDocument?.tools.thresholdAnnotationRenderer3D.setThreshold(
        threshold,
      );

      store?.editor.activeDocument?.tools.thresholdAnnotationRenderer3D.render();
    },
    [store],
  );

  const getHistogram = useCallback(
    () => store?.editor.activeDocument?.mainImageLayer?.densityHistogram,
    [store],
  );

  return store?.editor.activeDocument?.tools.thresholdAnnotationRenderer3D
    .holdsPreview ? (
    <StyledModal
      labelTx="threshold-annotation-title"
      headerChildren={
        <ModalHeaderButton
          icon="xSmall"
          tooltipTx="discard-threshold-annotation"
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
          store?.editor.activeDocument?.tools.thresholdAnnotationRenderer3D
            .previewColor
        }
        setValue={
          store?.editor.activeDocument?.tools.thresholdAnnotationRenderer3D
            .setPreviewColor
        }
      />
      <NumberRangeParam
        labelTx="threshold-annotation-threshold"
        serializationMethod="push"
        value={
          store?.editor.activeDocument?.tools.thresholdAnnotationRenderer3D
            .threshold
        }
        getHistogram={getHistogram}
        setValue={setThreshold}
        showRangeHandle
      />
      <ButtonParam
        labelTx="submit-threshold-annotation"
        isLast
        handlePress={submit}
      />
    </StyledModal>
  ) : null;
});
