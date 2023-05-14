import { useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import { useDatasetsBy } from "../../../queries";
import { DatasetsGrid } from "../datasets-grid";

export const DatasetsView: React.FC = observer(() => {
  const projectId = useParams().projectId || "";
  const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
    useDatasetsBy(projectId);
  const { t: translate } = useTranslation();

  const altMessage = useMemo(() => {
    if (isLoadingDatasets) return translate("datasets-loading");
    if (isErrorDatasets)
      return `${translate("datasets-loading-error")} ${
        datasetsError?.response?.statusText
      } (${datasetsError?.response?.status})`;
    if (datasets && datasets.length <= 0)
      return translate("no-datasets-available");
    return null;
  }, [isLoadingDatasets, isErrorDatasets, datasets, datasetsError, translate]);

  return <DatasetsGrid projectId={projectId} altMessage={altMessage} />;
});

export default DatasetsView;
