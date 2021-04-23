import {
  color,
  coverMixin,
  PopUp,
  Switch,
  zIndex,
  Text,
  Button,
} from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

const StyledOverlay = styled.div`
  ${coverMixin}

  align-items: center;
  background-color: ${color("modalUnderlay")};
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  pointer-events: auto;
  z-index: ${zIndex("overlay")};
`;

const InlineLabel = styled(Text)`
  font-size: 20px;
  margin-right: 25px;
`;

const InlineRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 10px;
`;

const ExportSwitch = styled(Switch)`
  font-size: 20px;
  width: 60%;
`;

const ExportButton = styled(Button)`
  margin: 10px 0;
`;

const ExportPopUpContainer = styled(PopUp)`
  align-items: center;
`;

export const ExportPopUp: React.FC = () => (
  <StyledOverlay>
    <ExportPopUpContainer label="Export" secondaryLabel="T1.nii">
      <InlineRow>
        <InlineLabel text="Export:" />
        <ExportSwitch items={[{ value: "Annotation" }, { value: "Scan" }]} />
      </InlineRow>
      <InlineRow>
        <InlineLabel text="Export as:" />
        <ExportSwitch
          items={[
            { value: "NIFTI" },
            { value: "DICOM" },
            { value: "PNG (Current Slice)" },
          ]}
        />
      </InlineRow>
      <ExportButton tx="export-button" />
    </ExportPopUpContainer>
  </StyledOverlay>
);
