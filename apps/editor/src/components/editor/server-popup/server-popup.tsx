/* eslint-disable max-len */
import {
  color,
  Icon,
  InvisibleButton,
  PopUp,
  Sheet,
  sheetNoise,
  SquareButton,
  Text,
  TextField,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ServerPopUpProps } from "./server-popup.props";

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
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;

const SingleColumn = styled.div`
  width: 100%;
  height: 100%;
  box-shadow: 1px 0px 0px 0px rgba(255, 255, 255, 0.2);
  padding: 0px 10px 0px 10px;
  overflow-x: hidden;
  overflow-y: auto;
`;

const SingleColumnLast = styled(SingleColumn)`
  box-shadow: none;
`;

const ListItemWrapper = styled(InvisibleButton)`
  width: 100%;
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

export const ServerPopUp = observer<ServerPopUpProps>(({ isOpen, onClose }) => {
  const store = useStore();

  const { data: studies } = useQuery("studies", () =>
    store?.dicomWebServer?.readStudies(),
  );

  const [selectedStudy, setSelectedStudy] = useState<string | undefined>();
  const { data: series } = useQuery(["series", selectedStudy], () =>
    selectedStudy
      ? store?.dicomWebServer?.readSeries(selectedStudy)
      : Promise.resolve([]),
  );

  const [selectedSeries, setSelectedSeries] = useState<string | undefined>();
  const { data: instances } = useQuery(
    ["instances", selectedStudy, selectedSeries],
    () =>
      selectedStudy && selectedSeries
        ? store?.dicomWebServer?.readInstances(selectedStudy, selectedSeries)
        : Promise.resolve([]),
  );

  return (
    <ServerPopUpContainer
      title="Import"
      isOpen={isOpen}
      onOutsidePress={onClose}
    >
      <InlineRow>
        <InlineElement>
          <SectionLabel text="Server" />
          <ImportInput value={store?.dicomWebServer?.url} />
        </InlineElement>
        <InlineElement>
          <SectionLabel text="Username" />
          <ImportInput placeholder="Capt. James Tiberius Kirk - 2" />
        </InlineElement>
        <ConnectButton
          icon="terminateConnection"
          color="red"
          onPointerDown={() => store?.connectToDICOMWebServer()}
        />
      </InlineRow>
      <InlineRowSecond>
        <ViewButton icon="columnView" />
        <ViewButtonLast icon="listView" />
        <SearchInput placeholder="Search" />
      </InlineRowSecond>
      <ColumnContainer>
        <SingleColumn>
          {studies?.map((study) => (
            <ListItemWrapper
              key={study.StudyInstanceUID}
              onPointerDown={() => setSelectedStudy(study.StudyInstanceUID)}
            >
              {study.StudyInstanceUID === selectedStudy ? (
                <ListItemActive>
                  <ListItemIcon icon="folder" />
                  <ListItemText text={study.PatientName || study.PatientID} />
                </ListItemActive>
              ) : (
                <ListItem>
                  <ListItemIcon icon="folder" />
                  <ListItemText text={study.PatientName || study.PatientID} />
                </ListItem>
              )}
            </ListItemWrapper>
          ))}
        </SingleColumn>
        <SingleColumn>
          {series?.map((thisSeries, index) => (
            <ListItemWrapper
              key={thisSeries.SeriesInstanceUID}
              onPointerDown={() =>
                setSelectedSeries(thisSeries.SeriesInstanceUID)
              }
            >
              {thisSeries.SeriesInstanceUID === selectedSeries ? (
                <ListItemActive>
                  <ListItemIcon icon="folder" />
                  <ListItemText
                    text={`${thisSeries.SeriesNumber || index}${
                      thisSeries.Modality ? ` (${thisSeries.Modality})` : ""
                    }`}
                  />
                </ListItemActive>
              ) : (
                <ListItem>
                  <ListItemIcon icon="folder" />
                  <ListItemText
                    text={`${thisSeries.SeriesNumber || index}${
                      thisSeries.Modality ? ` (${thisSeries.Modality})` : ""
                    }`}
                  />
                </ListItem>
              )}
            </ListItemWrapper>
          ))}
        </SingleColumn>
        <SingleColumnLast>
          {instances?.map((instance, index) => (
            <InvisibleButton key={instance.InstanceNumber || index}>
              <ListItem>
                <ListItemIcon icon="document" />
                <ListItemText text={`${instance.InstanceNumber || index}`} />
              </ListItem>
            </InvisibleButton>
          ))}
        </SingleColumnLast>
      </ColumnContainer>
    </ServerPopUpContainer>
  );
});
