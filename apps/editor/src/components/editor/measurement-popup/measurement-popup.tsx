import { PopUp, Text } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { MeasurementPopUpProps } from "./measurement-popup.props";

const StyledPopUp = styled(PopUp)`
  width: 280px;
`;

export const MeasurementPopUp: React.FC<MeasurementPopUpProps> = observer(
  ({ isOpen, onClose }) => {
    const store = useStore();

    const measurementType =
      store?.editor.activeDocument?.measurementType || "volume";

    const value =
      measurementType === "volume"
        ? store?.editor.activeDocument?.volumeDisplayLayer?.volume
        : store?.editor.activeDocument?.volumeDisplayLayer?.area?.area;

    return (
      <StyledPopUp
        titleTx={measurementType}
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        {value !== null && value !== undefined ? (
          <Text text={value.toFixed(2)} />
        ) : (
          <Text tx="calculating" />
        )}
      </StyledPopUp>
    );
  },
);
