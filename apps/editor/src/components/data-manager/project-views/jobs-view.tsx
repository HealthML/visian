import { useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import useJobsBy from "../../../queries/use-jobs-by";
import { JobHistory } from "../job-history";

export const JobsView: React.FC = observer(() => {
  const projectId = useParams().projectId || "";
  const { jobs, jobsError, isErrorJobs, isLoadingJobs } = useJobsBy(projectId);
  const { t: translate } = useTranslation();

  const altMessage = useMemo(() => {
    if (isLoadingJobs) return translate("jobs-loading");
    if (isErrorJobs)
      return `${translate("jobs-loading-error")} ${
        jobsError?.response?.statusText
      } (${jobsError?.response?.status})`;
    if (jobs && jobs.length <= 0) return translate("no-jobs-available");
    return null;
  }, [isLoadingJobs, isErrorJobs, jobs, jobsError, translate]);

  return <JobHistory projectId={projectId} altMessage={altMessage} />;
});

export default JobsView;
