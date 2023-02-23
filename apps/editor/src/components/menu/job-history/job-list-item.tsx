import { ListItem, Text } from "@visian/ui-shared";
import styled from "styled-components";

import { Job } from "../../../types";

const Spacer = styled.div`
  width: 10px;
`;

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

export const JobListItem = ({
  data,
  isHeader,
}: {
  data: Job;
  isHeader?: boolean;
}) => (
  <ListItem isActive={isHeader}>
    <Text>{data.modelName}</Text>
    <Spacer />
    <Text>{data.modelVersion}</Text>
    <Spacer />
    <Text>{data.startedAt}</Text>
    <Spacer />
    <Text>{data.finishedAt}</Text>
    <Spacer />
    <Text>{data.status}</Text>
  </ListItem>
);
