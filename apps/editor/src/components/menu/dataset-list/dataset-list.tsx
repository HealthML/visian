import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset } from "../../../types";
import { DatasetListItem } from "./dataset-list-item";

const StyledDatasetListContainer = styled.div`
  // width: 90vw;
  // margin: 0 auto;
  // margin-top: 2%;
  border: 1px solid silver;
`;

const StyledDatasetList = styled(List)`
  width: 90vw;
  height: 70vh;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 0.5fr));
  grid-gap: 10vw;
  justify-items: center;
  // border: 1px solid silver;
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
  <StyledDatasetListContainer>
    <StyledDatasetList onWheel={stopPropagation}>
      {datasets.map((dataset: Dataset) => (
        <StyledDatasetListItem key={dataset.id} dataset={dataset} />
      ))}
    </StyledDatasetList>
  </StyledDatasetListContainer>
);
