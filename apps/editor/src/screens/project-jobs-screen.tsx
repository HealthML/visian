import { Text, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

import { JobHistory } from "../components/menu/job-history";
import useJobsBy from "../queries/use-jobs-by";

export const ProjectJobsScreen: React.FC = observer(() => {
  const projectId = useParams().projectId || "";
  const { jobs, jobsError, isErrorJobs, isLoadingJobs } = useJobsBy(projectId);
  const { t: translate } = useTranslation();

  return isLoadingJobs ? (
    <Text>{translate("datasets-loading")}</Text>
  ) : isErrorJobs ? (
    <Text>{`${translate("datasets-loading-error")} ${
      jobsError?.response?.statusText
    } (${jobsError?.response?.status})`}</Text>
  ) : jobs && jobs.length > 0 ? (
    <JobHistory projectId={projectId} />
  ) : (
    <Text>{translate("no-datasets-available")}</Text>
  );
});

export default ProjectJobsScreen;
