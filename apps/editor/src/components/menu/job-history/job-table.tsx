import { Job } from "../../../types";
import { getDisplayDate } from "../util/display-date";
import styled from "styled-components";
import { fontWeight } from "@visian/ui-shared";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TableLayout, ListItemLabel, StatusBadge } from "@visian/ui-shared";

export const HeaderLabel = styled(ListItemLabel)`
  font-weight: ${fontWeight("bold")};
`;

const columnHelper = createColumnHelper<Job>();

function getDisplayJob(job: Job): Job {
  return {
    ...job,
    modelVersion: `v${job.modelVersion}`,
    startedAt: job.startedAt ? getDisplayDate(new Date(job.startedAt)) : "",
    finishedAt: job.finishedAt ? getDisplayDate(new Date(job.finishedAt)) : "",
  };
}

const badgeColors: Record<string, string> = {
  queued: "veryLightGray",
  running: "blueSheet",
  succeeded: "greenSheet",
  canceled: "orangeBorder",
  failed: "redBorder",
};

const columns = [
  columnHelper.accessor("modelName", {
    header: () => <HeaderLabel tx={"job-model-name"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("modelVersion", {
    header: () => <HeaderLabel tx={"job-model-version"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("startedAt", {
    header: () => <HeaderLabel tx={"job-started"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("finishedAt", {
    header: () => <HeaderLabel tx={"job-finished"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("status", {
    header: () => <HeaderLabel tx={"job-status"} />,
    cell: (props) => (
      <StatusBadge
        color={badgeColors[props.getValue()]}
        tx={`job-status-${props.getValue()}`}
      />
    ),
  }),
];

export const JobsTable = ({ jobs }: { jobs: Job[] }) => {
  const data = jobs.map((job: Job) => getDisplayJob(job));

  const columnWidths = [20, 10, 25, 25, 20];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return <TableLayout table={table} columnWidths={columnWidths} />;
};
