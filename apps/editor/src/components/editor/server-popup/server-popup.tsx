/* eslint-disable max-len */
import {
  PopUp,
  Text,
  TextField,
  SquareButton,
  color,
  sheetNoise,
  Icon,
  InvisibleButton,
  Sheet,
} from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;

const ImportInput = styled(TextField)`
  margin: 0px 0px 0px 0px;
  box-sizing: border-box;
`;

const SearchInput = styled(ImportInput)`
  margin: 0px 0px 0px 0px;
  box-sizing: border-box;
  width: 200px;
`;

const ConnectButton = styled(SquareButton)`
  margin-bottom: 0px;
  width: 84px;
  background: ${sheetNoise}, ${color("redSheet")};
  border-color: ${color("redBorder")};

  &:active {
    border-color: rgba(202, 51, 69, 1);
  }
`;

const InlineRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  width: 100%;
  margin-bottom: 20px;
  box-sizing: border-box;
`;

const ViewButton = styled(InvisibleButton)`
  width: 40px;
  height: 40px;
  margin-right: 4px;
`;

const ViewButtonLast = styled(ViewButton)`
  margin-right: 10px;
`;

const InlineRowSecond = styled(InlineRow)`
  justify-content: flex-end;
`;

const InlineElement = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  margin-right: 10px;
  width: 100%;
`;

const ServerPopUpContainer = styled(PopUp)`
  align-items: left;
  width: 800px;
  height: 650px;
  box-sizing: border-box;
`;

const ColumnContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const SingleColumn = styled.div`
  width: 100%;
  height: 100%;
  box-shadow: 1px 0px 0px 0px rgba(255, 255, 255, 0.2);
  padding: 0px 10px 0px 10px;
`;

const SingleColumnLast = styled(SingleColumn)`
  box-shadow: none;
`;

const ListItem = styled.div`
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  padding: 0px 4px 0px 4px;
`;

const ListItemActive = styled(Sheet)`
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  padding: 0px 4px 0px 4px;
`;

const ListItemIcon = styled(Icon)`
  margin-right: 4px;
  width: 40px;
`;

const ListItemText = styled(Text)`
  font-size: 16px;
  padding-top: 2px;
`;

export const ServerPopUp: React.FC = () => (
  <ServerPopUpContainer title="Import">
    <InlineRow>
      <InlineElement>
        <SectionLabel text="Server" />
        <ImportInput placeholder="https://federation-database.com" />
      </InlineElement>
      <InlineElement>
        <SectionLabel text="Username" />
        <ImportInput placeholder="Capt. James Tiberius Kirk - 2" />
      </InlineElement>
      <ConnectButton icon="terminateConnection" color="red" />
    </InlineRow>
    <InlineRowSecond>
      <ViewButton icon="columnView" />
      <ViewButtonLast icon="listView" />
      <SearchInput placeholder="Search" />
    </InlineRowSecond>
    <ColumnContainer>
      <SingleColumn>
        <ListItem>
          <ListItemIcon icon="folder" />
          <ListItemText text="Folder" />
        </ListItem>
        <ListItem>
          <ListItemIcon icon="folder" />
          <ListItemText text="Folder" />
        </ListItem>
        <ListItem>
          <ListItemIcon icon="folder" />
          <ListItemText text="Folder" />
        </ListItem>
        <ListItem>
          <ListItemIcon icon="folder" />
          <ListItemText text="Folder" />
        </ListItem>
        <ListItem>
          <ListItemIcon icon="folder" />
          <ListItemText text="Folder" />
        </ListItem>
        <ListItem>
          <ListItemIcon icon="folder" />
          <ListItemText text="Folder" />
        </ListItem>
        <ListItemActive>
          <ListItemIcon icon="folder" />
          <ListItemText text="Folder" />
        </ListItemActive>
      </SingleColumn>
      <SingleColumn>
        <ListItem>
          <ListItemIcon icon="folder" />
          <ListItemText text="Folder" />
        </ListItem>
        <ListItem>
          <ListItemIcon icon="folder" />
          <ListItemText text="Folder" />
        </ListItem>
        <ListItem>
          <ListItemIcon icon="folder" />
          <ListItemText text="Folder" />
        </ListItem>
        <ListItemActive>
          <ListItemIcon icon="folder" />
          <ListItemText text="Folder" />
        </ListItemActive>
      </SingleColumn>
      <SingleColumnLast>
        <ListItem>
          <ListItemIcon icon="document" />
          <ListItemText text="File" />
        </ListItem>
        <ListItem>
          <ListItemIcon icon="document" />
          <ListItemText text="File" />
        </ListItem>
        <ListItem>
          <ListItemIcon icon="document" />
          <ListItemText text="File" />
        </ListItem>
        <ListItem>
          <ListItemIcon icon="document" />
          <ListItemText text="File" />
        </ListItem>
        <ListItemActive>
          <ListItemIcon icon="document" />
          <ListItemText text="File" />
        </ListItemActive>
      </SingleColumnLast>
    </ColumnContainer>
  </ServerPopUpContainer>
);
