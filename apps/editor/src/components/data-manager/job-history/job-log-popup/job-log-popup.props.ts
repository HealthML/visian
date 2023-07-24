import type { StatefulPopUpProps } from "@visian/ui-shared";
import { MiaJob } from "@visian/utils";

export interface JobLogPopUpProps extends StatefulPopUpProps {
  job: MiaJob;
}
