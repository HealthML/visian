import { Modal, ModalHeaderButton } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

import type { MeasurementTool } from "../../../models";
import { Measurement } from "../measurement";

const StyledModal = styled(Modal)`
  margin-top: 16px;
`;

export const MeasurementModal = observer(() => {
  const store = useStore();

  const discard = useCallback(() => {
    (store?.editor.activeDocument?.tools.tools[
      "measurement-tool"
    ] as MeasurementTool).discard();
    store?.editor.activeDocument?.tools.setIsCursorOverFloatingUI(false);
  }, [store]);

  return (store?.editor.activeDocument?.tools.tools[
    "measurement-tool"
  ] as MeasurementTool).hasPath ? (
    <StyledModal
      labelTx="measurement-title"
      headerChildren={
        <ModalHeaderButton
          icon="xSmall"
          tooltipTx="discard-measurement"
          onPointerDown={discard}
        />
      }
    >
      <Measurement
        value={
          (store?.editor.activeDocument?.tools.tools[
            "measurement-tool"
          ] as MeasurementTool).pathLength
        }
        measurementType="length"
        unit={store?.editor.activeDocument?.baseImageLayer?.image.unit}
        prefixTx="measurement-length"
        textSize="small"
      />
    </StyledModal>
  ) : null;
});
