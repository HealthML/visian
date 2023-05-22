import {
  Modal,
  Screen,
  Text,
  useIsDraggedOver,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { DatasetExplorer } from "../components/data-manager/dataset-explorer";
import { UIOverlayDataManager } from "../components/data-manager/ui-overlay-data-manager";
import { useDataset } from "../queries";

const StyledModal = styled(Modal)`
  width: 100%;
`;

const ErrorMessage = styled(Text)`
  margin: auto;
`;

export const DatasetScreen: React.FC = observer(() => {
  const datasetId = useParams().datasetId || "";

  const { dataset, datasetError, isErrorDataset, isLoadingDataset } =
    useDataset(datasetId);

  const { t: translate } = useTranslation();

  const altMessage = useMemo(() => {
    if (isLoadingDataset) return translate("dataset-loading");
    if (isErrorDataset)
      return `${translate("dataset-loading-error")} ${
        datasetError?.response?.statusText
      } (${datasetError?.response?.status})`;
    return null;
  }, [isLoadingDataset, isErrorDataset, datasetError, translate]);

  const [isDraggedOver, { onDrop, ...dragListeners }] = useIsDraggedOver();

  return (
    <Screen
      {...dragListeners}
      title={`${translate("dataset-base-title")} ${
        isLoadingDataset
          ? translate("loading")
          : isErrorDataset
          ? translate("error")
          : dataset
          ? dataset.name
          : ""
      }`}
    >
      <UIOverlayDataManager
        homeButton
        backLink={dataset && `/projects/${dataset.project}/datasets`}
        main={
          altMessage ? (
            <StyledModal>
              <ErrorMessage tx={altMessage} />
            </StyledModal>
          ) : (
            dataset && (
              <DatasetExplorer
                dataset={dataset}
                isDraggedOver={isDraggedOver}
                onDropCompleted={onDrop}
              />
            )
          )
        }
      />
    </Screen>
  );
});

export default DatasetScreen;
