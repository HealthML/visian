import { StatusBadge } from "@visian/ui-shared";
import { MiaJobStatusEnum } from "@visian/utils";

const statusColors: Record<MiaJobStatusEnum, string> = {
  queued: "veryVeryLightGray",
  running: "blueBadgeBackground",
  succeeded: "greenBadgeBackground",
  canceled: "orangeBadgeBackground",
  failed: "redBadgeBackground",
};

const statusBorderColors: Record<MiaJobStatusEnum, string> = {
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
  status: MiaJobStatusEnum;
  full?: boolean;
}) => (
  <StatusBadge
    color={statusColors[status]}
    borderColor={statusBorderColors[status]}
    tx={`job-status-${status}`}
    full={full}
  />
);
