import { Job } from "../../../types";
import { getDisplayDate } from "../util/display-date";
import styled from "styled-components";
import { fontWeight } from "@visian/ui-shared";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TableLayout, ListItemLabel } from "@visian/ui-shared";

function getDisplayJob(job: Job): Job {
  return {
    ...job,
    modelVersion: `v${job.modelVersion}`,
    startedAt: job.startedAt ? getDisplayDate(new Date(job.startedAt)) : "",
    finishedAt: job.finishedAt ? getDisplayDate(new Date(job.finishedAt)) : "",
  };
}

export const HeaderLabel = styled(ListItemLabel)`
  font-weight: ${fontWeight("bold")};
`;

const columnHelper = createColumnHelper<Job>();

const columns = [
  columnHelper.accessor("modelName", {
    header: () => <HeaderLabel text={"Model"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("modelVersion", {
    header: () => <HeaderLabel text={"Version"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("startedAt", {
    header: () => <HeaderLabel text={"Started At"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("finishedAt", {
    header: () => <HeaderLabel text={"Finished At"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
  }),
  columnHelper.accessor("status", {
    header: () => <HeaderLabel text={"Status"} />,
    cell: (props) => <ListItemLabel text={props.getValue()} />,
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
