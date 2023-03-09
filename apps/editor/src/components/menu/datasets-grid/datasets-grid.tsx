import { Modal, Text, useTranslation } from "@visian/ui-shared";
import styled from "styled-components";

import useDatasetsBy from "../../../queries/use-datasets-by";
import { DatasetList } from "../dataset-list";

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
  position: relative;
`;

export const DatasetsGrid = ({ projectId }: { projectId: string }) => {
  const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
    useDatasetsBy(projectId);
  const { t: translate } = useTranslation();

  return isLoadingDatasets || isErrorDatasets ? (
    <StyledModal labelTx={isLoadingDatasets ? "dataset-loading" : "error"}>
      {isLoadingDatasets ? (
        <Text>{translate("dataset-loading")}</Text>
      ) : (
        <Text>
          {`${translate("dataset-loading-error")} ${
            datasetsError?.response?.statusText
          } (${datasetsError?.response?.status})`}
        </Text>
      )}
    </StyledModal>
  ) : (
    <StyledModal>
      {datasets && datasets.length > 0 ? (
        <DatasetList datasets={datasets} />
      ) : (
        <Text>{translate("no-datasets-available")}</Text>
      )}
    </StyledModal>
  );
};
