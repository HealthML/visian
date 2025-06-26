import { Screen, useIsDraggedOver, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

import { DatasetPage, Page, PageError, PageLoadingBlock } from "../components";
import { useDataset } from "../queries";

export const DatasetScreen: React.FC = observer(() => {
  const { t: translate } = useTranslation();

  const datasetId = useParams().datasetId || "";
  const { dataset, isErrorDataset, isLoadingDataset } = useDataset(datasetId);

  const [isDraggedOver, { onDrop, ...dragListeners }] = useIsDraggedOver();

  let pageContent = <PageLoadingBlock labelTx="dataset" backPath="/projects" />;

  if (isErrorDataset) {
    pageContent = (
      <PageError backPath="/projects" errorTx="dataset-loading-failed" />
    );
  } else if (dataset) {
    pageContent = (
      <DatasetPage
        dataset={dataset}
        isDraggedOver={isDraggedOver}
        onDropCompleted={onDrop}
      />
    );
  }

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
      <Page>{pageContent}</Page>
    </Screen>
  );
});

export default DatasetScreen;
