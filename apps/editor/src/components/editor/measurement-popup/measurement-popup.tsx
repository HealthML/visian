import {
  FlexRow,
  PopUp,
  Text,
  Theme,
  InfoText,
  InvisibleButton,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
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

const SpacedRow = styled(FlexRow)`
  gap: 7px;
`;

const CopyButton = styled(InvisibleButton).attrs(() => ({
  isActive: false,
  tooltipPosition: "left",
}))`
  margin-top: -4px;
  height: 24px;
  width: 24px;
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

    const copyValue = useCallback(() => {
      if (value === undefined || value === null) return;

      if (navigator.clipboard) {
        return navigator.clipboard.writeText(value.toFixed(2));
      }
    }, [value]);

    return (
      <StyledPopUp
        titleTx={measurementType}
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        {value !== null && value !== undefined ? (
          <MeasurementRow>
            <SpacedRow>
              <StyledText text={value.toFixed(2)} />
              {unit && <StyledText tx={`${measurementType}-${unit}`} />}
            </SpacedRow>
            <SpacedRow>
              <CopyButton
                icon="copyClipboard"
                onPointerDown={copyValue}
                tooltipTx="copy"
              />
              <StyledInfoText
                titleTx="unit"
                infoTx="info-unit"
                baseZIndex={theme.zIndices.overlay}
              />
            </SpacedRow>
          </MeasurementRow>
        ) : (
          <Text tx="calculating" />
        )}
      </StyledPopUp>
    );
  },
);
