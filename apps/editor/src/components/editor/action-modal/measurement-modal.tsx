import { Modal, ModalHeaderButton, Text, i18n } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";

import type { MeasurementTool } from "../../../models";

const StyledModal = styled(Modal)`
  margin-top: 16px;
`;

const StyledText = styled(Text)`
  user-select: text;
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
      <StyledText>
        {`${i18n.t("measurement-length")} ${(store?.editor.activeDocument?.tools
          .tools["measurement-tool"] as MeasurementTool).pathLength.toFixed(
          2,
        )}`}
      </StyledText>
    </StyledModal>
  ) : null;
});
