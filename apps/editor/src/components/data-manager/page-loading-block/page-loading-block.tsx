import { LoadingBlock } from "@visian/ui-shared";

import { PageTitle } from "../page-title";
import { PageLoadingBlockProps } from "./page-loading-block.props";

export const PageLoadingBlock = ({
  label,
  labelTx,
  backPath,
}: PageLoadingBlockProps) => (
  <>
    <PageTitle label={label} labelTx={labelTx} backPath={backPath} isLoading />
    <LoadingBlock height="400px" />
  </>
);
