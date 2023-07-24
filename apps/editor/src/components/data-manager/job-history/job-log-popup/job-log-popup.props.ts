import { Job } from "@visian/mia-api";
import type { StatefulPopUpProps } from "@visian/ui-shared";


export interface JobLogPopUpProps extends StatefulPopUpProps {
  job: Job;
}
