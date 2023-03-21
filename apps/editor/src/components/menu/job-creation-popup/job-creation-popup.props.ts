import type { StatefulPopUpProps } from "@visian/ui-shared";

export interface JobCreationPopUpProps extends StatefulPopUpProps {
  projectId: string;
  activeImageSelection?: string[];
  openWithDatasetId?: string;
}
