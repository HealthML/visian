import { stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset } from "../../../types";
import { DatasetListItem } from "./dataset-list-item";

const StyledDatasetList = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4vh 3.5vw;
  margin: 3% auto 3% auto;
  overflow-y: auto;
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
        deleteDataset={() => deleteDataset(dataset)}
      />
    ))}
  </StyledDatasetList>
);
