import { Screen, useTranslation } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

import { JobPage, Page, PageError, PageLoadingBlock } from "../components";
import { useJob } from "../queries";

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
