import { PopUp, Text, Theme } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled, { useTheme } from "styled-components";

import { useStore } from "../../../app/root-store";
import { Measurement } from "../measurement";
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
        ? store?.editor.activeDocument?.measurementDisplayLayer?.volume
        : store?.editor.activeDocument?.measurementDisplayLayer?.area?.area;

    const unit =
      store?.editor.activeDocument?.measurementDisplayLayer?.image.unit;

    const theme = useTheme() as Theme;

    return (
      <StyledPopUp
        titleTx={measurementType}
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        {value !== null && value !== undefined ? (
          <Measurement
            value={value}
            measurementType={measurementType}
            unit={unit}
            infoBaseZIndex={theme.zIndices.overlay}
          />
        ) : (
          <Text tx="calculating" />
        )}
      </StyledPopUp>
    );
  },
);
