import { AbsoluteCover, Text, useTranslation } from "@visian/ui-shared";
import styled from "styled-components";

import useDatasetsBy from "../../../queries/use-datasets-by";
import { DatasetList } from "../dataset-list";

const Main = styled(AbsoluteCover)`
  height: 75vh;
  width: 75vw;
  margin: auto;
  overflow-y: auto;
`;

export const DatasetsGrid = ({ projectId }: { projectId: string }) => {
  const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
    useDatasetsBy(projectId);
  const { t: translate } = useTranslation();

  return isLoadingDatasets || isErrorDatasets ? (
    <Main title={isLoadingDatasets ? "datasets-loading" : "error"}>
      {isLoadingDatasets ? (
        <Text>{translate("datasets-loading")}</Text>
      ) : (
        <Text>
          {`${translate("datasets-loading-error")} ${
            datasetsError?.response?.statusText
          } (${datasetsError?.response?.status})`}
        </Text>
      )}
    </Main>
  ) : (
    <Main>
      {datasets && datasets.length > 0 ? (
        <DatasetList datasets={datasets} />
      ) : (
        <Text>{translate("no-datasets-available")}</Text>
      )}
    </Main>
  );
};
