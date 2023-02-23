import { Job } from "../../../types";
import { getDisplayDate } from "../util/display-date";

import { JobsTableLayout } from "./jobs-table-layout";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

function getDisplayJob(job: Job): Job {
  return {
    ...job,
    modelVersion: `v${job.modelVersion}`,
    startedAt: job.startedAt ? getDisplayDate(new Date(job.startedAt)) : "",
    finishedAt: job.finishedAt ? getDisplayDate(new Date(job.finishedAt)) : "",
  };
}

const columnHelper = createColumnHelper<Job>();

const columns = [
  columnHelper.accessor("modelName", {
    header: "Model",
  }),
  columnHelper.accessor("modelVersion", {
    header: "Version",
  }),
  columnHelper.accessor("startedAt", {
    header: "Started At",
  }),
  columnHelper.accessor("finishedAt", {
    header: "Finished At",
  }),
  columnHelper.accessor("status", {
    header: "Status",
  }),
];

export const JobsTable = ({ jobs }: { jobs: Job[] }) => {
  const data = jobs.map((job: Job) => getDisplayJob(job));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return <JobsTableLayout table={table} />;
};
