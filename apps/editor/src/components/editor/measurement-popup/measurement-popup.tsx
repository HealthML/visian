import { FlexRow, PopUp, Text, Theme, InfoText } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import styled, { useTheme } from "styled-components";

import { useStore } from "../../../app/root-store";
import { MeasurementPopUpProps } from "./measurement-popup.props";

const StyledPopUp = styled(PopUp)`
  width: 280px;
`;

const MeasurementRow = styled(FlexRow)`
  width: 100%;
  justify-content: space-between;
`;

const StyledInfoText = styled(InfoText)`
  margin-right: 5px;
`;

const StyledText = styled(Text)`
  font-size: 13pt;
`;

const TextRow = styled(FlexRow)`
  gap: 7px;
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
          <MeasurementRow>
            <TextRow>
              <StyledText text={value.toFixed(2)} />
              {unit && <StyledText tx={`${measurementType}-${unit}`} />}
            </TextRow>
            <StyledInfoText
              titleTx="unit"
              infoTx="info-unit"
              baseZIndex={theme.zIndices.overlay}
            />
          </MeasurementRow>
        ) : (
          <Text tx="calculating" />
        )}
      </StyledPopUp>
    );
  },
);
