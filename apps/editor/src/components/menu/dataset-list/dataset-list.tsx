import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Dataset } from "../../../types";
import { DatasetListItem } from "./dataset-list-item";

const StyledProjectList = styled(List)`
  width: 100%;
  height: 400px;
  overflow-y: auto;
`;

export const DatasetList = ({ datasets }: { datasets: Dataset[] }) => (
  <StyledProjectList onWheel={stopPropagation}>
    {datasets.map((dataset: Dataset) => (
      <DatasetListItem dataset={dataset} />
    ))}
  </StyledProjectList>
);
