import { Screen, Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

import { DatasetExplorer } from "../components/menu/dataset-explorer";
import { UIOverlayDataManager } from "../components/menu/ui-overlay-data-manager";
import { useDataset } from "../queries";

export const DatasetScreen: React.FC = observer(() => {
  const datasetId = useParams().datasetId || "";

  const { dataset, datasetError, isErrorDataset, isLoadingDataset } =
    useDataset(datasetId);

  const { t: translate } = useTranslation();

  return (
    <Screen
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
          isLoadingDataset ? (
            <Text>{translate("dataset-loading")}</Text>
          ) : isErrorDataset ? (
            <Text>
              {translate("dataset-loading-error")} $
              {datasetError?.response?.statusText} ($
              {datasetError?.response?.status})`
            </Text>
          ) : dataset ? (
            <DatasetExplorer dataset={dataset} />
          ) : (
            <Text>{translate("no-dataset-available")}</Text>
          )
        }
      />
    </Screen>
  );
});

export default DatasetScreen;
