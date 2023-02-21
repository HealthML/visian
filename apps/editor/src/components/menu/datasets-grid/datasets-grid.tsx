import {
  Box,
  InvisibleButton,
  Modal,
  Screen,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import useDatasetsBy from "../../../queries/use-datasets-by";
import { DatasetList } from "../dataset-list";

const StyledModal = styled(Modal)`
  vertical-align: middle;
  width: 100%;
  position: relative;
`;

export const DatasetsGrid = () => {
  const projectId = useParams().projectId || "";

  const { datasets, datasetsError, isErrorDatasets, isLoadingDatasets } =
    useDatasetsBy(projectId);
  const { t: translate } = useTranslation();

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isLoadingDatasets || isErrorDatasets ? (
        <StyledModal labelTx={isLoadingDatasets ? "project-loading" : "error"}>
          {isLoadingDatasets ? (
            <Text>{translate("project-loading")}</Text>
          ) : (
            <Text>
              {`${translate("project-loading-error")} ${
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
      )}
    </>
  );
};
