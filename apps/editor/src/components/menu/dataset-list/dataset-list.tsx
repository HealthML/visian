import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset } from "../../../types";
import { DatasetListItem } from "./dataset-list-item";

const StyledDatasetList = styled(List)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 30px;
  row-gap: 60px;
  justify-items: center;
  margin-top: 2%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ccc #fff;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track {
    background-color: #fff;
    border-radius: 10px;
  }
`;

const StyledDatasetListItem = styled(DatasetListItem)`
  height: 100px;
`;

export const DatasetList = ({ datasets }: { datasets: Dataset[] }) => (
  <StyledDatasetList onWheel={stopPropagation}>
    {datasets.map((dataset: Dataset) => (
      <StyledDatasetListItem key={dataset.id} dataset={dataset} />
    ))}
  </StyledDatasetList>
);
