import { Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

import { DatasetsGrid } from "../components/data-manager/datasets-grid";
import { useDatasetsBy } from "../queries";

export const ProjectDatasetsScreen: React.FC = observer(() => {
  const projectId = useParams().projectId || "";
  const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
    useDatasetsBy(projectId);
  const { t: translate } = useTranslation();

  return isLoadingDatasets ? (
    <Text>{translate("datasets-loading")}</Text>
  ) : isErrorDatasets ? (
    <Text>{`${translate("datasets-loading-error")} ${
      datasetsError?.response?.statusText
    } (${datasetsError?.response?.status})`}</Text>
  ) : datasets && datasets.length > 0 ? (
    <DatasetsGrid projectId={projectId} />
  ) : (
    <Text>{translate("no-datasets-available")}</Text>
  );
});

export default ProjectDatasetsScreen;
