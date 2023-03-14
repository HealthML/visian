import { ListItem, Text } from "@visian/ui-shared";
import styled from "styled-components";

import { Job } from "../../../types";

const Spacer = styled.div`
  width: 10px;
`;

const ExpandedSpacer = styled.div`
  margin-right: auto;
`;

export const JobListItem = ({ job }: { job: Job }) => (
  <ListItem>
    <Text>{job.modelName}</Text>
    <Spacer />
    <Text>{job.modelVersion}</Text>
    <ExpandedSpacer />
    <Text>{job.status}</Text>
  </ListItem>
);
