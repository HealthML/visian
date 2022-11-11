import { Button, PopUp, Switch, Text } from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

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
  <ExportPopUpContainer title="Export" secondaryTitle="T1.nii">
    <InlineRow>
      <InlineLabel text="Export:" />
      <ExportSwitch options={[{ value: "Annotation" }, { value: "Scan" }]} />
    </InlineRow>
    <InlineRow>
      <InlineLabel text="Export as:" />
      <ExportSwitch
        options={[
          { value: "NIFTI" },
          { value: "DICOM" },
          { value: "PNG (Current Slice)" },
        ]}
      />
    </InlineRow>
    <ExportButton tx="export" />
  </ExportPopUpContainer>
);
