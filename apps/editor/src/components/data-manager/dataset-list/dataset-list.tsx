import { space, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset } from "../../../types";
import { DatasetListItem } from "./dataset-list-item";

const StyledDatasetList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${space("pageSectionMarginSmall")};
  user-select: none;
`;

export const DatasetList = ({
  datasets,
  deleteDataset,
}: {
  datasets: Dataset[];
  deleteDataset: (dataset: Dataset) => void;
}) => (
  <StyledDatasetList onWheel={stopPropagation}>
    {datasets.map((dataset: Dataset) => (
      <DatasetListItem
        key={dataset.id}
        dataset={dataset}
        deleteDataset={deleteDataset}
      />
    ))}
  </StyledDatasetList>
);
