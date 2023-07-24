import type { StatefulPopUpProps } from "@visian/ui-shared";

import { Job } from "@visian/mia-api";

export interface JobLogPopUpProps extends StatefulPopUpProps {
  job: Job;
}
