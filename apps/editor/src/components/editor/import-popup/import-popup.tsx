/* eslint-disable max-len */
import { PopUp, Text, Button, TextField } from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;

const ImportInput = styled(TextField)`
  margin: 0px 10px 0px 0px;
  width: 100%;
`;

const ImportButton = styled(Button)`
  min-width: 110px;
`;

const InlineRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 28px;
`;

const InlineRowLast = styled(InlineRow)`
  margin-bottom: 10px;
`;

const DropZoneContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
  margin-bottom: 28px;
  border-radius: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.3);
  /* background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='#fff' rx='8' ry='8' stroke='%23333' stroke-width='1' stroke-dasharray='10%2c 10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");*/
`;

const DropZoneLabel = styled(Text)`
  font-size: 14px;
  margin-right: 10px;
`;

const ImportPopUpContainer = styled(PopUp)`
  align-items: left;
  width: 400px;
`;

export const ImportPopUp: React.FC = () => (
  <ImportPopUpContainer title="Import">
    <SectionLabel text="Upload from Computer" />
    <DropZoneContainer>
      <DropZoneLabel text="Drop files or" />
      <ImportButton tx="Browse" />
    </DropZoneContainer>
    <SectionLabel text="Download from URL" />
    <InlineRow>
      <ImportInput placeholder="https://..." />
      <ImportButton tx="Download" />
    </InlineRow>
    <SectionLabel text="Connect to Server" />
    <InlineRowLast>
      <ImportInput placeholder="https://..." />
      <ImportButton tx="Connect" />
    </InlineRowLast>
  </ImportPopUpContainer>
);
