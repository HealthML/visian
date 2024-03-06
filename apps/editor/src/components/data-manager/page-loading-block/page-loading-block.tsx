import { LoadingBlock } from "@visian/ui-shared";

import { PageLoadingBlockProps } from "./page-loading-block.props";
import { PageTitle } from "../page-title";

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
