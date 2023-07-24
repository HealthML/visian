import { MiaJob } from "@visian/utils";
import type { StatefulPopUpProps } from "@visian/ui-shared";

export interface JobLogPopUpProps extends StatefulPopUpProps {
  job: MiaJob;
}
