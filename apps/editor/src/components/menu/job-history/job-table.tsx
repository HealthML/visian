import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  HeaderLabel,
  ListItemLabel,
  StatusBadge,
  TableLayout,
} from "@visian/ui-shared";
import React, { useCallback } from "react";

import { Job } from "../../../types";
import { getDisplayDate } from "../util/display-date";
import { JobDetailsPopUp } from "./job-details-popup/job-details-popup";

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
];
export const JobsTable = ({ jobs }: { jobs: Job[] }) => {
  const data = jobs.map((job: Job) => getDisplayJob(job));

  const columnWidths = [20, 10, 25, 25, 20];

  const [isPopupOpen, setPopUpOpen] = React.useState<boolean>(false);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);

  const openPopup = useCallback(() => {
    setPopUpOpen(true);
  }, []);
  const closePopup = useCallback(() => {
    setPopUpOpen(false);
  }, []);

  const handleOnClick = (job: Job) => {
    setSelectedJob(job);
    openPopup();
  };

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
  return (
    <>
      {selectedJob && (
        <JobDetailsPopUp
          job={selectedJob}
          isOpen={isPopupOpen}
          onClose={closePopup}
        />
      )}
      <TableLayout
        table={table}
        columnWidths={columnWidths}
        onRowClick={handleOnClick}
      />
    </>
  );
};
