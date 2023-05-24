import type { StatefulPopUpProps } from "@visian/ui-shared";

import { Job } from "../../../../types";

export interface JobLogPopUpProps extends StatefulPopUpProps {
  job: Job;
}
