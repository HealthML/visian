import { Screen, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

import { JobPage } from "../components/data-manager/job-page";
import { Page } from "../components/data-manager/page";
import { PageError } from "../components/data-manager/page-error";
import { PageLoadingBlock } from "../components/data-manager/page-loading-block";
import useJob from "../queries/use-job";

export const JobScreen: React.FC = observer(() => {
  const { t: translate } = useTranslation();

  const jobId = useParams().jobId || "";
  const { job, isErrorJob, isLoadingJob } = useJob(jobId);

  let pageContent = <PageLoadingBlock labelTx="job" backPath="/projects" />;

  if (isErrorJob) {
    pageContent = (
      <PageError backPath="/projects" errorTx="job-loading-failed" />
    );
  } else if (job) {
    pageContent = <JobPage job={job} />;
  }

  return (
    <Screen
      title={`${translate("jobs-base-title")} ${
        isLoadingJob
          ? translate("loading")
          : isErrorJob
          ? translate("error")
          : job
          ? job.startedAt
          : ""
      }`}
    >
      <Page>{pageContent}</Page>
    </Screen>
  );
});

export default JobScreen;
