import {
  color,
  Icon,
  InvisibleButton,
  PopUp,
  Sheet,
  sheetNoise,
  SquareButton,
  styledScrollbarMixin,
  Text,
  TextInput,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { ServerPopUpProps } from "./server-popup.props";

const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;

const ImportInput = styled(TextInput)`
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
  ${styledScrollbarMixin}

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

// TODO: Make use of the UI components hidden by this flag
const showTodoUI = false;

export const ServerPopUp = observer<ServerPopUpProps>(({ isOpen, onClose }) => {
  const store = useStore();
  const queryClient = useQueryClient();

  const { data: studies, isLoading: isLoadingStudies } = useQuery(
    "studies",
    () => store?.dicomWebServer?.searchStudies(),
  );

  const [selectedStudy, setSelectedStudy] = useState<string | undefined>();
  const { data: series, isLoading: isLoadingSeries } = useQuery(
    ["series", selectedStudy],
    () =>
      selectedStudy
        ? store?.dicomWebServer?.searchSeries(selectedStudy)
        : Promise.resolve([]),
  );

  const loadSeries = useCallback(
    (seriesId: string) => {
      if (!selectedStudy) return;
      if (store?.editor.newDocument()) {
        store?.setProgress({ labelTx: "importing" });
        store?.dicomWebServer
          ?.retrieveSeries(selectedStudy, seriesId)
          .then((files) => {
            const thisSeries = series?.find(
              (currentSeries) => currentSeries.SeriesInstanceUID === seriesId,
            );

            return store.editor.activeDocument?.importFile(
              files,
              String(
                thisSeries
                  ? thisSeries.SeriesNumber || thisSeries.SeriesInstanceUID
                  : seriesId,
              ),
            );
          })
          .then(() => {
            const study = studies?.find(
              (currentStudy) => currentStudy.StudyInstanceUID === selectedStudy,
            );
            if (study) {
              store?.editor.activeDocument?.setTitle(
                study.PatientName || study.PatientID || study.StudyInstanceUID,
              );
            }

            store?.editor.activeDocument?.finishBatchImport();
            onClose?.();
          })
          .catch((error) => {
            store?.setError({
              titleTx: "import-error",
              descriptionTx: error.message,
            });
          })
          .finally(() => {
            store?.setProgress();
          });
      }
    },
    [onClose, selectedStudy, series, store, studies],
  );

  const disconnect = useCallback(() => {
    store?.connectToDICOMWebServer();
    queryClient.invalidateQueries("studies");
    queryClient.invalidateQueries("series");
  }, [queryClient, store]);

  return (
    <ServerPopUpContainer
      title="Import"
      isOpen={isOpen}
      dismiss={onClose}
      shouldDismissOnOutsidePress
    >
      <InlineRow>
        <InlineElement>
          <SectionLabel text="Server" />
          <ImportInput value={store?.dicomWebServer?.url} isEditable={false} />
        </InlineElement>
        {showTodoUI && (
          <InlineElement>
            <SectionLabel text="Username" />
            <ImportInput placeholder="Capt. James Tiberius Kirk - 2" />
          </InlineElement>
        )}
        <ConnectButton
          icon="terminateConnection"
          color="red"
          onPointerDown={disconnect}
        />
      </InlineRow>
      {showTodoUI && (
        <InlineRowSecond>
          <ViewButton icon="columnView" />
          <ViewButtonLast icon="listView" />
          <SearchInput placeholder="Search" />
        </InlineRowSecond>
      )}
      <ColumnContainer>
        <SingleColumn>
          {isLoadingStudies && <Text tx="loading" />}
          {studies?.map((study) => (
            <ListItemWrapper
              key={study.StudyInstanceUID}
              onPointerDown={() => setSelectedStudy(study.StudyInstanceUID)}
            >
              {study.StudyInstanceUID === selectedStudy ? (
                <ListItemActive>
                  <ListItemIcon icon="folder" />
                  <ListItemText
                    text={
                      study.PatientName ||
                      study.PatientID ||
                      study.StudyInstanceUID
                    }
                  />
                </ListItemActive>
              ) : (
                <ListItem>
                  <ListItemIcon icon="folder" />
                  <ListItemText
                    text={
                      study.PatientName ||
                      study.PatientID ||
                      study.StudyInstanceUID
                    }
                  />
                </ListItem>
              )}
            </ListItemWrapper>
          ))}
        </SingleColumn>
        <SingleColumnLast>
          {isLoadingSeries && <Text tx="loading" />}
          {selectedStudy &&
            series?.map((thisSeries, index) => (
              <ListItemWrapper
                key={thisSeries.SeriesInstanceUID}
                onPointerDown={() => loadSeries(thisSeries.SeriesInstanceUID)}
              >
                <ListItem>
                  <ListItemIcon icon="document" />
                  <ListItemText
                    text={`${thisSeries.SeriesNumber || index}${
                      thisSeries.Modality ? ` (${thisSeries.Modality})` : ""
                    }`}
                  />
                </ListItem>
              </ListItemWrapper>
            ))}
        </SingleColumnLast>
      </ColumnContainer>
    </ServerPopUpContainer>
  );
});
