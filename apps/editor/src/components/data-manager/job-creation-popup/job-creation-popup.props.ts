import type { StatefulPopUpProps } from "@visian/ui-shared";
import { AxiosError } from "axios";
import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
} from "react-query";

import { Job } from "mia-api-client";

export interface JobCreationPopUpProps extends StatefulPopUpProps {
  projectId: string;
  activeImageSelection?: Set<string>;
  openWithDatasetId?: string;
  refetchJobs?: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined,
  ) => Promise<QueryObserverResult<Job[], AxiosError<Job[], unknown>>>;
}
