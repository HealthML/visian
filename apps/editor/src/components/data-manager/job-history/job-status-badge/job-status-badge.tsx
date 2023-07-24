import { JobStatusEnum } from "@visian/mia-api";
import { StatusBadge } from "@visian/ui-shared";


const statusColors: Record<JobStatusEnum, string> = {
  queued: "veryVeryLightGray",
  running: "blueBadgeBackground",
  succeeded: "greenBadgeBackground",
  canceled: "orangeBadgeBackground",
  failed: "redBadgeBackground",
};

const statusBorderColors: Record<JobStatusEnum, string> = {
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
  status: JobStatusEnum;
  full?: boolean;
}) => (
  <StatusBadge
    color={statusColors[status]}
    borderColor={statusBorderColors[status]}
    tx={`job-status-${status}`}
    full={full}
  />
);
