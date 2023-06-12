import { StatusBadge } from "@visian/ui-shared";

import { JobStatus } from "../../../../types";

const statusColors: Record<JobStatus, string> = {
  queued: "veryVeryLightGray",
  running: "blueBackground",
  succeeded: "greenBackground",
  canceled: "orangeBackground",
  failed: "redBackground",
};

const statusBorderColors: Record<JobStatus, string> = {
  queued: "sheetBorder",
  running: "blueBorder",
  succeeded: "greenBorder",
  canceled: "orangeBorder",
  failed: "redBorder",
};

export const JobStatusBadge = ({
  status,
  full,
}: {
  status: JobStatus;
  full?: boolean;
}) => (
  <StatusBadge
    color={statusColors[status]}
    borderColor={statusBorderColors[status]}
    tx={`job-status-${status}`}
    full={full}
  />
);
