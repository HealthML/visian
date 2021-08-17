import { PopUp, Text, Button, TextField } from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

const LogInInput = styled(TextField)`
  margin: 0px 0px 14px 0px;
  width: 240px;
`;

const LogInButton = styled(Button)`
  margin-top: 20px;
  min-width: 110px;
`;

const ProcessTitle = styled(Text)`
  font-size: 26px;
  font-weight: 400;
  margin-bottom: 28px;
`;

const LogInPopUpContainer = styled(PopUp)`
  align-items: center;
  justify-content: center;
  width: 320px;
  padding: 40px 40px 42px 40px;
`;

export const LogInPopUp: React.FC = () => (
  <LogInPopUpContainer>
    <ProcessTitle text="Connect to Server" />
    <LogInInput placeholder="Server" />
    <LogInInput placeholder="Username" />
    <LogInInput placeholder="Password" />
    <LogInButton text="Connect" />
  </LogInPopUpContainer>
);
