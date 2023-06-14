import { LoadingBlock } from "@visian/ui-shared";

import { PageTitle } from "../page-title";

export const PageLoadingBlock = ({
  label,
  labelTx,
  backPath,
}: {
  label?: string;
  labelTx?: string;
  backPath?: string;
}) => (
  <>
    <PageTitle label={label} labelTx={labelTx} backPath={backPath} isLoading />
    <LoadingBlock height="400px" />
  </>
);
