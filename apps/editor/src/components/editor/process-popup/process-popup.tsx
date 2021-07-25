import { PopUp, Text } from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

const ProcessTitle = styled(Text)`
  font-size: 20px;
  margin-bottom: 24px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.2);
`;

const ProgressBar = styled.div`
  height: 100%;
  width: 80%;
  background-color: #fff;
`;

const ProcessPopUpContainer = styled(PopUp)`
  align-items: center;
  justify-content: center;
  width: 400px;
  height: auto;
  padding: 30px 50px 38px 50px;
`;

export const ProcessPopUp: React.FC = () => (
  <ProcessPopUpContainer>
    <ProcessTitle tx="Exporting" />
    <ProgressBarContainer>
      <ProgressBar />
    </ProgressBarContainer>
  </ProcessPopUpContainer>
);
