import {
  FlexRow,
  i18n,
  InfoText,
  InvisibleButton,
  Text,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";

import { MeasurementProps } from "./measurement.props";

const MeasurementRow = styled(FlexRow)`
  width: 100%;
  justify-content: space-between;
`;

const StyledInfoText = styled(InfoText)`
  margin-right: 5px;
`;

const StyledText = styled(Text)<Pick<MeasurementProps, "textSize">>`
  font-size: ${(props) => (props.textSize === "large" ? "13pt" : "10pt")};
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

export const Measurement: React.FC<MeasurementProps> =
  observer<MeasurementProps>(
    ({
      value,
      measurementType,
      unit,
      infoBaseZIndex,
      prefix,
      prefixTx,
      textSize = "large",
    }) => {
      const copyValue = useCallback(() => {
        if (value === undefined || value === null) return;

        if (navigator.clipboard) {
          return navigator.clipboard.writeText(value.toFixed(2));
        }
      }, [value]);

      return (
        <MeasurementRow>
          <SpacedRow>
            <StyledText
              textSize={textSize}
              text={`${
                prefixTx ? `${i18n.t(prefixTx)}: ` : prefix ? `${prefix}: ` : ""
              }${value.toFixed(2)}`}
            />
            {unit && (
              <StyledText
                textSize={textSize}
                tx={`${measurementType}-${unit}`}
              />
            )}
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
              baseZIndex={infoBaseZIndex}
            />
          </SpacedRow>
        </MeasurementRow>
      );
    },
  );
