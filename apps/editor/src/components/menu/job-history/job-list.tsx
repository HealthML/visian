import { List, stopPropagation } from "@visian/ui-shared";
import styled from "styled-components";

import { Job } from "../../../types";
import { JobListItem } from "./job-list-item";

const StyledList = styled(List)`
  width: 100%;
  overflow-y: auto;
`;

export const JobList = ({ jobs }: { jobs: Job[] }) => (
  <StyledList onWheel={stopPropagation}>
    {jobs.map((job: Job) => (
      <JobListItem job={job} key={`${job.id}`} />
    ))}
  </StyledList>
);
