import { JobStatus, StatusBadge } from "@visian/ui-shared";

const statusColors: Record<JobStatus, string> = {
  queued: "veryVeryLightGray",
  running: "blueBadgeBackground",
  succeeded: "greenBadgeBackground",
  canceled: "orangeBadgeBackground",
  failed: "redBadgeBackground",
};

const statusBorderColors: Record<JobStatus, string> = {
  queued: "sheetBorder",
  running: "blueBorder",
  succeeded: "greenBadgeBorder",
  canceled: "orangeBadgeBorder",
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
