import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset } from "../../../types";
import { DatasetListItem } from "./dataset-list-item";

const StyledDatasetList = styled(List)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 3vw;
  row-gap: 60px;
  justify-items: center;
  margin-top: 2%;
  overflow-y: auto;
  user-select: none;
  scrollbar-width: thin;
  scrollbar-color: #ccc #fff;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 15px;
  }
  &::-webkit-scrollbar-track {
    background-color: #fff;
    border-radius: 15px;
  }
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
