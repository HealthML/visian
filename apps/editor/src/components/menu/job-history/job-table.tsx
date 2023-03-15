import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  HeaderLabel,
  Icon,
  ListItemLabel,
  StatusBadge,
  TableLayout,
} from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

import { Job } from "../../../types";
import { getDisplayDate } from "../util/display-date";

const StyledIcon = styled(Icon)`
  width: 30px;
`;

function getDisplayJob(job: Job): Job {
  return {
    ...job,
    modelVersion: `v${job.modelVersion}`,
    startedAt: job.startedAt
      ? getDisplayDate(new Date(job.startedAt))
      : undefined,
    finishedAt: job.finishedAt
      ? getDisplayDate(new Date(job.finishedAt))
      : undefined,
  };
}

const badgeColors: Record<string, string> = {
  queued: "veryVeryLightGray",
  running: "blueBackground",
  succeeded: "greenBackground",
  canceled: "orangeBackground",
  failed: "redBackground",
};

const badgeBorderColors: Record<string, string> = {
  queued: "sheetBorder",
  running: "blueBorder",
  succeeded: "greenBorder",
  canceled: "orangeBorder",
  failed: "redBorder",
};

const columnHelper = createColumnHelper<Job>();

const columns = [
  columnHelper.accessor("modelName", {
    header: () => <HeaderLabel tx="job-model-name" />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("modelVersion", {
    header: () => <HeaderLabel tx="job-model-version" />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("startedAt", {
    header: () => <HeaderLabel tx="job-started" />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
    sortingFn: "datetime",
    sortUndefined: -1,
  }),
  columnHelper.accessor("finishedAt", {
    header: () => <HeaderLabel tx="job-finished" />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
    sortingFn: "datetime",
    sortUndefined: -1,
  }),
  columnHelper.accessor("status", {
    header: () => <HeaderLabel tx="job-status" />,
    cell: (props) => (
      <StatusBadge
        color={badgeColors[props.getValue()]}
        borderColor={badgeBorderColors[props.getValue()]}
        tx={`job-status-${props.getValue()}`}
      />
    ),
    // Make sure that queued jobs are at the top
    sortingFn: (rowA, rowB, id) => {
      if (rowA.getValue(id) === "queued") return -1;
      return 0;
    },
  }),
  columnHelper.display({
    id: "expand",
    cell: (props) => {
      if (props.row.original.status === "succeeded") {
        return <StyledIcon icon="arrowLeft" />;
      }
      return null;
    },
  }),
];

export const JobsTable = ({ jobs }: { jobs: Job[] }) => {
  const data = jobs.map((job: Job) => getDisplayJob(job));

  const columnWidths = [15, 10, 25, 25, 20, 5];

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "status", desc: false },
    { id: "finishedAt", desc: true },
    { id: "startedAt", desc: true },
  ]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    initialState: { sorting },
    enableSorting: true,
    enableMultiSort: true,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return <TableLayout table={table} columnWidths={columnWidths} />;
};
