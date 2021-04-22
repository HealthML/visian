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
  display: flex;
  justify-content: center;
  background-color: ${color("modalUnderlay")};
  z-index: ${zIndex("overlay")};
  backdrop-filter: blur(3px);
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
    <ExportPopUpContainer label="Export" filename="T1.nii">
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
