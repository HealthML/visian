import type { StatefulPopUpProps } from "@visian/ui-shared";

import { Job } from "mia-api-client";

export interface JobLogPopUpProps extends StatefulPopUpProps {
  job: Job;
}
