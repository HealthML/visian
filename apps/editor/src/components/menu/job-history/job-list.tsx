import { Job } from "../../../types";
import { getDisplayDate } from "../util/display-date";

import { TableLayout } from "../../../../../../libs/ui-shared/src/lib/components/table";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ListItemLabel } from "@visian/ui-shared";

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
    header: () => <ListItemLabel text={"Model"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("modelVersion", {
    header: () => <ListItemLabel text={"Version"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("startedAt", {
    header: () => <ListItemLabel text={"Started At"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("finishedAt", {
    header: () => <ListItemLabel text={"Finished At"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("status", {
    header: () => <ListItemLabel text={"Status"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
];

export const JobsTable = ({ jobs }: { jobs: Job[] }) => {
  const data = jobs.map((job: Job) => getDisplayJob(job));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return <TableLayout table={table} />;
};
