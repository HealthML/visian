import { InvisibleButton, ListItem, StatusBadge } from "@visian/ui-shared";
import styled from "styled-components";

import { AnnotationListItemProps } from "./annotation-list-item.props";

const ExpandedSpacer = styled.div`
  flex-grow: 1;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
`;

export const AnnotationListItem: React.FC<AnnotationListItemProps> = ({
  isVerified,
  isInSelectMode,
  deleteAnnotation,
  children,
}) => (
  <ListItem>
    {children}
    {isVerified && (
      <>
        <ExpandedSpacer />
        <StatusBadge
          color="rgb(70, 215, 70, 0.3)"
          borderColor="greenBorder"
          text="verified"
        />
      </>
    )}
    {!isInSelectMode && (
      <IconButton
        icon="trash"
        tooltipTx="delete-annotation-title"
        onPointerDown={() => {
          deleteAnnotation();
        }}
        style={{ marginLeft: "auto" }}
        tooltipPosition="left"
      />
    )}
  </ListItem>
);
