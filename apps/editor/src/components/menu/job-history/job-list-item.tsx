import { ListItem, Text } from "@visian/ui-shared";
import styled from "styled-components";

import { Job } from "../../../types";
import { getDisplayDate } from "../util/display-date";

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
    <Text>v{job.modelVersion}</Text>
    <Spacer />
    <Text>{job.startedAt ? getDisplayDate(new Date(job.startedAt)) : ""}</Text>
    <Spacer />
    <Text>
      {job.finishedAt ? getDisplayDate(new Date(job.finishedAt)) : ""}
    </Text>
    <Spacer />
    <Text>{job.status}</Text>
  </ListItem>
);
