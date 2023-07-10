import { StatusBadge } from "@visian/ui-shared";
import { MiaJobStatus } from "@visian/utils";

const statusColors: Record<MiaJobStatus, string> = {
  queued: "veryVeryLightGray",
  running: "blueBadgeBackground",
  succeeded: "greenBadgeBackground",
  canceled: "orangeBadgeBackground",
  failed: "redBadgeBackground",
};

const statusBorderColors: Record<MiaJobStatus, string> = {
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
  status: MiaJobStatus;
  full?: boolean;
}) => (
  <StatusBadge
    color={statusColors[status]}
    borderColor={statusBorderColors[status]}
    tx={`job-status-${status}`}
    full={full}
  />
);
