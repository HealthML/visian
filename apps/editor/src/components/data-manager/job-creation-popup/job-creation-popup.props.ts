import type { StatefulPopUpProps } from "@visian/ui-shared";
import type { MiaImage, MiaJob } from "@visian/utils";
import { AxiosError } from "axios";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "react-query";

export interface JobCreationPopUpProps extends StatefulPopUpProps {
  projectId: string;
  activeImageSelection?: Set<MiaImage>;
  openWithDatasetId?: string;
  refetchJobs?: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined,
  ) => Promise<QueryObserverResult<MiaJob[], AxiosError<MiaJob[], unknown>>>;
}
