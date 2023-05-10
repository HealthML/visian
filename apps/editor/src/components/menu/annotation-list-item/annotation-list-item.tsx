import { ListItem, StatusBadge } from "@visian/ui-shared";
import styled from "styled-components";

import { AnnotationListItemProps } from "./annotation-list-item.props";

const VerifiedStatusBadge = styled(StatusBadge)`
  width: 100%;
`;

export const AnnotationListItem: React.FC<AnnotationListItemProps> = ({
  isVerified,
  children,
}) => (
  <ListItem>
    {isVerified && <VerifiedStatusBadge borderColor="grey" text="verified" />}
    {children}
  </ListItem>
);
