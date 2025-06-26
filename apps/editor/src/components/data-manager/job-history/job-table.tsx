import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { HeaderLabel, ListItemLabel, TableLayout } from "@visian/ui-shared";
import { MiaJob } from "@visian/utils";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { getDisplayDate } from "../util/display-date";
import { JobStatusBadge } from "./job-status-badge/job-status-badge";

const BadgeContainer = styled.div`
  width: 10em;
`;

function getDisplayJob(job: MiaJob): MiaJob {
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

const columnHelper = createColumnHelper<MiaJob>();

const columns = [
  columnHelper.accessor("name", {
    header: () => <HeaderLabel tx="name" />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
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
      <BadgeContainer>
        <JobStatusBadge status={props.getValue()} full />
      </BadgeContainer>
    ),
    // Make sure that queued jobs are at the top
    sortingFn: (rowA, rowB, id) => {
      if (rowA.getValue(id) === "queued") return -1;
      return 0;
    },
  }),
];
export const JobsTable = ({ jobs }: { jobs: MiaJob[] }) => {
  const data = jobs.map((job: MiaJob) => getDisplayJob(job));

  const columnWidths = [20, 10, 25, 25, 20];

  const navigate = useNavigate();

  const handleOnClick = useCallback(
    (job: MiaJob) => navigate(`/jobs/${job.id}`),
    [navigate],
  );

  const [sorting, setSorting] = useState<SortingState>([
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
  return (
    <TableLayout
      table={table}
      columnWidths={columnWidths}
      onRowClick={handleOnClick}
    />
  );
};
