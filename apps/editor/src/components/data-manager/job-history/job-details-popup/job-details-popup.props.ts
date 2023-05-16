import type { StatefulPopUpProps } from "@visian/ui-shared";

import { Job } from "../../../../types";

export interface JobDetailsPopUpProps extends StatefulPopUpProps {
  job: Job;
}
