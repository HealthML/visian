import { StatusBadge } from "@visian/ui-shared";
import styled from "styled-components";

const ExpandedSpacer = styled.div`
  flex-grow: 1;
`;

export const VerifiedTag = ({ hasSpacing }: { hasSpacing?: boolean }) => (
  <>
    {hasSpacing && <ExpandedSpacer />}
    <StatusBadge textColor="verified" borderColor="gray" tx="verified" />
  </>
);
